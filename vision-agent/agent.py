from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from vision_agents.core import Agent, AgentLauncher, Runner, User
from vision_agents.core.utils.audio_filter import AudioFilter
from vision_agents.plugins import getstream, openai


ROOT_DIR = Path(__file__).resolve().parents[1]
SERVICE_DIR = Path(__file__).resolve().parent


def load_environment() -> None:
    load_dotenv(ROOT_DIR / ".env")
    load_dotenv(SERVICE_DIR / ".env", override=True)


def required_env(name: str) -> str:
    value = os.getenv(name)

    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")

    return value


class PassthroughAudioFilter(AudioFilter):
    async def process_audio(self, pcm: Any, participant: Any) -> Any:
        return pcm

    def clear(self, participant: Any | None = None) -> None:
        return None


def build_teacher_instructions(**kwargs: Any) -> str:
    language_name = kwargs.get("language_name") or kwargs.get("languageName")
    lesson_title = kwargs.get("lesson_title") or kwargs.get("lessonTitle")
    language = language_name or "the selected language"
    lesson = lesson_title or "the selected lesson"

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
