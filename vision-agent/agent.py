from __future__ import annotations

import os
import re
import logging
import asyncio
import time
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from getstream import AsyncStream
from vision_agents.core import Agent, AgentLauncher, Runner, User
from vision_agents.core.agents.conversation import Conversation, Message, MessageState
from vision_agents.core.instructions import Instructions
from vision_agents.core.utils.audio_filter import AudioFilter
from vision_agents.plugins import getstream, openai


ROOT_DIR = Path(__file__).resolve().parents[1]
SERVICE_DIR = Path(__file__).resolve().parent
AGENT_USER_ID = "lingua-ai-teacher"
MAX_METADATA_LENGTH = 80
MAX_CAPTION_BUFFER_LENGTH = 24
USER_LANGUAGE = "台灣國語"
CAPTION_BUFFERS: dict[str, list[dict[str, Any]]] = {}
CAPTION_EVENTS: dict[str, asyncio.Event] = {}
logger = logging.getLogger(__name__)
DIRECTIVE_PATTERNS = (
    r"\byou\s+are\b",
    r"\bignore\s+(all\s+)?previous\b",
    r"\bdisregard\s+(all\s+)?previous\b",
    r"\bforget\s+(all\s+)?previous\b",
    r"\bsystem\s*(prompt|message|instructions?)?\b",
    r"\bdeveloper\s*(message|instructions?)?\b",
    r"\bassistant\s*(message|instructions?)?\b",
    r"\bact\s+as\b",
    r"\bpretend\s+to\s+be\b",
    r"<\|[^>]+?\|>",
)


def load_environment() -> None:
    load_dotenv(ROOT_DIR / ".env")
    load_dotenv(SERVICE_DIR / ".env", override=True)


def required_env(name: str) -> str:
    value = os.getenv(name)

    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")

    return value


def sanitize_metadata(value: Any, fallback: str) -> str:
    if not isinstance(value, str):
        return fallback

    text = re.sub(r"[\x00-\x1f\x7f]+", " ", value)
    text = re.sub(r"\s+", " ", text).strip()

    if not text:
        return fallback

    for pattern in DIRECTIVE_PATTERNS:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE)

    text = re.sub(r"\s+", " ", text).strip(" -:;,.")

    if not text:
        return fallback

    return text[:MAX_METADATA_LENGTH].strip()


def sanitize_metadata_list(values: Any, fallback: list[str], limit: int = 4) -> list[str]:
    if not isinstance(values, list):
        return fallback

    sanitized_values = [
        sanitize_metadata(value, "") for value in values if isinstance(value, str)
    ]

    return [value for value in sanitized_values if value][:limit] or fallback


def sanitize_lesson_items(values: Any, key: str, limit: int = 4) -> list[str]:
    if not isinstance(values, list):
        return []

    items: list[str] = []

    for value in values:
        if not isinstance(value, dict):
            continue

        item = sanitize_metadata(value.get(key), "")

        if item:
            items.append(item)

        if len(items) >= limit:
            break

    return items


def as_mapping(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def get_call_custom_data(response: Any) -> dict[str, Any]:
    data = getattr(response, "data", None)
    call = getattr(data, "call", None)
    custom = getattr(call, "custom", None)

    return as_mapping(custom)


def apply_agent_instructions(agent: Agent, instructions: str) -> None:
    agent.instructions = Instructions(input_text=instructions)

    realtime_session = getattr(agent.llm, "realtime_session", None)
    if isinstance(realtime_session, dict):
        realtime_session["instructions"] = agent.instructions.full_reference


class PassthroughAudioFilter(AudioFilter):
    async def process_audio(self, pcm: Any, participant: Any) -> Any:
        return pcm

    def clear(self, participant: Any | None = None) -> None:
        return None


class CaptionMirroringConversation(Conversation):
    def __init__(self, base: Conversation, stream_call: Any, call_id: str):
        super().__init__(instructions=base.instructions, messages=base.messages)
        self.base = base
        self.call_id = call_id
        self.stream_call = stream_call
        self._last_caption_by_message_id: dict[str, str] = {}
        self._caption_tasks: set[asyncio.Task[None]] = set()

    async def upsert_message(
        self,
        role: str,
        user_id: str,
        content: str = "",
        message_id: str | None = None,
        content_index: int | None = None,
        completed: bool = True,
        replace: bool = False,
        original: Any = None,
    ) -> Message:
        message = await self.base.upsert_message(
            role=role,
            user_id=user_id,
            content=content,
            message_id=message_id,
            content_index=content_index,
            completed=completed,
            replace=replace,
            original=original,
        )
        self.messages = self.base.messages
        await self._mirror_caption(role=role, user_id=user_id, message=message)

        return message

    async def _sync_to_backend(
        self, message: Message, state: MessageState, completed: bool
    ) -> None:
        return None

    async def _mirror_caption(
        self,
        role: str,
        user_id: str,
        message: Message,
    ) -> None:
        text = re.sub(r"\s+", " ", message.content).strip()

        if role not in {"assistant", "user"} or not text:
            return

        previous_text = self._last_caption_by_message_id.get(message.id or "")

        if previous_text == text:
            return

        self._last_caption_by_message_id[message.id or ""] = text
        speaker_id = AGENT_USER_ID if role == "assistant" else user_id
        caption = {
            "createdAt": int(time.time() * 1000),
            "id": message.id,
            "role": role,
            "speakerId": speaker_id,
            "text": text,
        }
        captions = CAPTION_BUFFERS.setdefault(self.call_id, [])
        captions.append(caption)
        del captions[:-MAX_CAPTION_BUFFER_LENGTH]
        CAPTION_EVENTS.setdefault(self.call_id, asyncio.Event()).set()

        task = asyncio.create_task(
            self._send_caption_event(
                caption_id=caption["id"],
                role=role,
                speaker_id=speaker_id,
                text=text,
            ),
        )
        self._caption_tasks.add(task)
        task.add_done_callback(self._on_caption_task_done)

    def _on_caption_task_done(self, task: asyncio.Task[None]) -> None:
        self._caption_tasks.discard(task)

        if task.cancelled():
            return

        error = task.exception()

        if error:
            logger.exception(
                "Failed to mirror transcript into Stream custom event",
                exc_info=error,
            )

    async def _send_caption_event(
        self,
        caption_id: str | None,
        role: str,
        speaker_id: str,
        text: str,
    ) -> None:
        try:
            await self.stream_call.send_call_event(
                user_id=AGENT_USER_ID,
                custom={
                    "type": "lingua.live_caption",
                    "captionId": caption_id,
                    "role": role,
                    "speakerId": speaker_id,
                    "text": text,
                },
            )
        except Exception:
            logger.exception("Failed to mirror transcript into Stream custom event")


def cleanup_caption_state(call_id: str) -> None:
    event = CAPTION_EVENTS.get(call_id)

    if event:
        event.set()

    CAPTION_BUFFERS.pop(call_id, None)
    CAPTION_EVENTS.pop(call_id, None)


def build_teacher_instructions(**kwargs: Any) -> str:
    payload = as_mapping(kwargs.get("custom")) or kwargs
    lesson_payload = as_mapping(payload.get("lesson"))
    language_payload = as_mapping(payload.get("language"))
    language = sanitize_metadata(
        payload.get("language_name")
        or payload.get("languageName")
        or language_payload.get("name"),
        "the selected language",
    )
    lesson = sanitize_metadata(
        payload.get("lesson_title")
        or payload.get("lessonTitle")
        or lesson_payload.get("title"),
        "the selected lesson",
    )
    goals = sanitize_metadata_list(
        lesson_payload.get("goals") or payload.get("goals"),
        [],
    )
    vocabulary = sanitize_lesson_items(
        lesson_payload.get("vocabulary") or payload.get("vocabulary"),
        "term",
    )
    phrases = sanitize_lesson_items(
        lesson_payload.get("phrases") or payload.get("phrases"),
        "phrase",
    )
    teacher_prompt = sanitize_metadata(
        lesson_payload.get("aiTeacherPrompt") or payload.get("aiTeacherPrompt"),
        "",
    )
    lesson_context = [
        f"Lesson goals: {', '.join(goals)}." if goals else "",
        f"Vocabulary to practice: {', '.join(vocabulary)}." if vocabulary else "",
        f"Target phrases: {', '.join(phrases)}." if phrases else "",
        f"Lesson note: {teacher_prompt}." if teacher_prompt else "",
    ]

    return "\n".join(
        [
            "你是 Lingua 友善的 AI 語言老師。",
            "你只透過語音教學。每次回答都要短、清楚、好跟讀。",
            f"使用者目前的介面語言是{USER_LANGUAGE}。你必須預設用{USER_LANGUAGE}和繁體中文詞彙說話。",
            f"除非使用者明確要求換語言，否則不要用英文解釋、寒暄或串場。",
            f"英文、法文、西班牙文、日文、韓文等外語只能出現在本課要練習的目標單字或短句。",
            f"教 {language} 時，一律用{USER_LANGUAGE}解釋意思、給回饋和引導下一步。",
            f"目前課程是 {lesson}。",
            "開場先用國語問候學習者，說出課程名稱，然後請他跟讀一個簡單短句。",
            "學習者回答後，用一句簡短國語給發音回饋，再給下一個練習提示。",
            "口語輸出不要使用 markdown、項目符號、特殊符號或冗長解釋。",
            *[item for item in lesson_context if item],
        ],
    )


async def create_agent(**kwargs: Any) -> Agent:
    load_environment()
    required_env("STREAM_API_KEY")
    required_env("STREAM_API_SECRET")
    required_env("OPENAI_API_KEY")
    instructions = build_teacher_instructions(**kwargs)

    agent = Agent(
        edge=getstream.Edge(),
        agent_user=User(name="Lingua AI 老師", id=AGENT_USER_ID),
        instructions=instructions,
        llm=openai.Realtime(
            model="gpt-realtime",
            voice="marin",
            fps=1,
            realtime_session={
                "type": "realtime",
                "audio": {
                    "input": {
                        "transcription": {"model": "gpt-4o-mini-transcribe"},
                        "turn_detection": {
                            "type": "semantic_vad",
                            "create_response": True,
                            "interrupt_response": True,
                        },
                    },
                },
            },
            send_video=False,
        ),
        processors=[],
        multi_speaker_filter=PassthroughAudioFilter(),
    )
    apply_agent_instructions(agent, instructions)

    return agent


async def join_call(
    agent: Agent,
    call_type: str,
    call_id: str,
    **kwargs: Any,
) -> None:
    call = await agent.create_call(call_type, call_id)
    response = await call.get()
    custom_data = get_call_custom_data(response)
    opening_prompt = (
        "請用台灣國語溫暖地問候學習者，語氣自然、有精神、專注。"
        "只說一到兩句簡短口語句子，接著請學習者慢慢跟讀一個本課目標語言的單字或短句。"
        "除了要跟讀的目標單字或短句以外，不要說英文。"
    )

    if custom_data:
        lesson_instructions = build_teacher_instructions(custom=custom_data)
        apply_agent_instructions(agent, lesson_instructions)
        opening_prompt = (
            "現在請用台灣國語，以這堂課的 AI 老師身分溫暖問候學習者。"
            "內容必須嚴格限於目前課程的目標、單字、短句和情境。"
            "只說一到兩句簡短口語句子，慢慢介紹一個目標語言單字或短句，"
            "用國語說明意思，然後請學習者跟讀。"
            "除了要跟讀的目標單字或短句以外，不要說英文。"
        )

    async with agent.join(call):
        stream = AsyncStream(
            api_key=required_env("STREAM_API_KEY"),
            api_secret=required_env("STREAM_API_SECRET"),
        )
        stream_call = stream.video.call(call_type, call_id)
        caption_conversation = CaptionMirroringConversation(
            agent.conversation,
            stream_call,
            call_id,
        )
        agent.conversation = caption_conversation
        agent._flow.set_conversation(caption_conversation)
        agent.llm.set_conversation(caption_conversation)

        try:
            await agent.simple_response(opening_prompt)
            await agent.finish()
        finally:
            try:
                await stream.aclose()
            finally:
                cleanup_caption_state(call_id)


def attach_caption_routes(runner: Runner) -> None:
    @runner.fast_api.get("/calls/{call_id}/captions")
    async def get_captions(call_id: str, after: int = 0) -> dict[str, Any]:
        event = CAPTION_EVENTS.setdefault(call_id, asyncio.Event())
        event.clear()

        captions = [
            caption
            for caption in CAPTION_BUFFERS.get(call_id, [])
            if int(caption.get("createdAt", 0)) > after
        ]

        if captions:
            return {"captions": captions}

        try:
            await asyncio.wait_for(event.wait(), timeout=25)
        except TimeoutError:
            return {"captions": []}

        return {
            "captions": [
                caption
                for caption in CAPTION_BUFFERS.get(call_id, [])
                if int(caption.get("createdAt", 0)) > after
            ],
        }


if __name__ == "__main__":
    load_environment()
    runner = Runner(
        AgentLauncher(
            create_agent=create_agent,
            join_call=join_call,
            max_concurrent_sessions=5,
            max_sessions_per_call=1,
        ),
    )
    attach_caption_routes(runner)
    runner.cli()
