# Lingua Vision Agent

Voice-only AI language teacher service using Vision Agents, OpenAI Realtime, and Stream Edge.

The service loads secrets from the parent project `.env` first, then from `vision-agent/.env` if present. Keep these values server-side only:

```bash
STREAM_API_KEY=...
STREAM_API_SECRET=...
OPENAI_API_KEY=...
```

Run locally with Python 3.12 and uv:

```bash
cd vision-agent
uv venv --python 3.12
uv sync
uv run agent.py serve --host 0.0.0.0 --port 8000
```

Development console mode:

```bash
uv run agent.py run
```

The mobile app should create the Stream call. The agent service joins that call by `call_type` and `call_id`, then speaks English by default while teaching the selected language through English.
