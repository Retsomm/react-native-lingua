from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from vision_agents.core import Agent, AgentLauncher, Runner, User
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


class PassthroughAudioFilter(AudioFilter):
    async def process_audio(self, pcm: Any, participant: Any) -> Any:
        return pcm

    def clear(self, participant: Any | None = None) -> None:
        return None


def build_teacher_instructions(**kwargs: Any) -> str:
    lesson_data = kwargs.get("lesson")
    lesson_payload = lesson_data if isinstance(lesson_data, dict) else {}
    language = sanitize_metadata(
        kwargs.get("language_name") or kwargs.get("languageName"),
        "the selected language",
    )
    lesson = sanitize_metadata(
        kwargs.get("lesson_title") or kwargs.get("lessonTitle"),
        "the selected lesson",
    )
    goals = sanitize_metadata_list(lesson_payload.get("goals"), [])
    vocabulary = sanitize_lesson_items(lesson_payload.get("vocabulary"), "term")
    phrases = sanitize_lesson_items(lesson_payload.get("phrases"), "phrase")
    teacher_prompt = sanitize_metadata(lesson_payload.get("aiTeacherPrompt"), "")
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

    return Agent(
        edge=getstream.Edge(),
        agent_user=User(name="Lingua AI Teacher", id="lingua-ai-teacher"),
        instructions=build_teacher_instructions(**kwargs),
        llm=openai.Realtime(
            model="gpt-realtime",
            voice="marin",
            fps=1,
            send_video=False,
        ),
        processors=[],
        multi_speaker_filter=PassthroughAudioFilter(),
    )


async def join_call(
    agent: Agent,
    call_type: str,
    call_id: str,
    **kwargs: Any,
) -> None:
    call = await agent.create_call(call_type, call_id)

    async with agent.join(call):
        await agent.simple_response(
            "Greet the learner in English, introduce yourself as their AI teacher, "
            "and begin the first short speaking practice.",
        )
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
