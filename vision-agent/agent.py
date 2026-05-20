from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from vision_agents.core import Agent, AgentLauncher, Runner, User
from vision_agents.core.instructions import Instructions
from vision_agents.core.utils.audio_filter import AudioFilter
from vision_agents.plugins import getstream, openai


ROOT_DIR = Path(__file__).resolve().parents[1]
SERVICE_DIR = Path(__file__).resolve().parent
MAX_METADATA_LENGTH = 80
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
            "You are Lingua's friendly AI language teacher.",
            "You are voice only. Keep every response short, clear, and easy to repeat.",
            "Always speak English by default, even when teaching another language.",
            f"Teach {language} through English.",
            f"The current lesson is {lesson}.",
            "Start by greeting the learner, naming the lesson, and asking them to repeat one simple phrase.",
            "When the learner answers, give brief pronunciation feedback and continue with one next practice prompt.",
            "Do not use markdown, bullets, special symbols, or long explanations in spoken output.",
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
        agent_user=User(name="Lingua AI Teacher", id="lingua-ai-teacher"),
        instructions=instructions,
        llm=openai.Realtime(
            model="gpt-realtime",
            voice="marin",
            fps=1,
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
        "Greet the learner warmly in English as their AI teacher. Sound human, "
        "energetic, and focused. Use one or two short conversational sentences, "
        "then ask them to repeat one target-language word or phrase slowly."
    )

    if custom_data:
        lesson_instructions = build_teacher_instructions(custom=custom_data)
        apply_agent_instructions(agent, lesson_instructions)
        opening_prompt = (
            "Now greet the learner warmly in English as their AI teacher for this "
            "lesson only. Stay strictly within the current lesson goal, vocabulary, "
            "phrases, and context. Use one or two short conversational sentences, "
            "introduce one target-language word or phrase slowly with its English "
            "meaning, and ask the learner to repeat it."
        )

    async with agent.join(call):
        await agent.simple_response(opening_prompt)
        await agent.finish()


if __name__ == "__main__":
    load_environment()
    Runner(
        AgentLauncher(
            create_agent=create_agent,
            join_call=join_call,
            max_concurrent_sessions=5,
            max_sessions_per_call=1,
        ),
    ).cli()
