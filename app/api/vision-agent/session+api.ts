import type { LessonActivity, PhraseItem, VocabularyItem } from "@/types/learning";

type AgentSessionRequest = {
  callId?: string;
  callType?: string;
  languageId?: string;
  languageName?: string;
  lesson?: {
    activities?: LessonActivity[];
    aiTeacherPrompt?: string;
    description?: string;
    goals?: string[];
    phrases?: PhraseItem[];
    vocabulary?: VocabularyItem[];
  };
  lessonId?: string;
  lessonTitle?: string;
};

type AgentSessionStopRequest = {
  callId?: string;
  sessionId?: string;
};

function getVisionAgentBaseUrl() {
  const baseUrl = process.env.VISION_AGENT_BASE_URL?.replace(/\/+$/, "");

  if (!baseUrl) {
    throw new Error("Missing VISION_AGENT_BASE_URL");
  }

  return baseUrl;
}

async function readErrorMessage(response: Response) {
  const data = (await response.json().catch(() => null)) as
    | { detail?: string; error?: string; message?: string }
    | null;

  return (
    data?.error ??
    data?.message ??
    data?.detail ??
    "Unable to connect to the AI teacher service."
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AgentSessionRequest;

    if (!body.callId || !body.callType) {
      return Response.json(
        { error: "callId and callType are required." },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${getVisionAgentBaseUrl()}/calls/${body.callId}/sessions`,
      {
        body: JSON.stringify({
          call_type: body.callType,
          language_id: body.languageId,
          language_name: body.languageName,
          lesson: body.lesson,
          lesson_id: body.lessonId,
          lesson_title: body.lessonTitle,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );

    if (!response.ok) {
      return Response.json(
        { error: await readErrorMessage(response) },
        { status: response.status },
      );
    }

    const data = (await response.json()) as {
      session_id?: string;
      sessionId?: string;
    };
    const sessionId = data.session_id ?? data.sessionId;

    if (!sessionId) {
      return Response.json(
        { error: "AI teacher service did not return a session id." },
        { status: 502 },
      );
    }

    return Response.json({ sessionId });
  } catch (error) {
    console.error("Failed to start Vision Agent session", error);

    return Response.json(
      { error: "Unable to start the AI teacher session." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as AgentSessionStopRequest;

    if (!body.callId || !body.sessionId) {
      return Response.json(
        { error: "callId and sessionId are required." },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${getVisionAgentBaseUrl()}/calls/${body.callId}/sessions/${body.sessionId}`,
      { method: "DELETE" },
    );

    if (!response.ok && response.status !== 404) {
      return Response.json(
        { error: await readErrorMessage(response) },
        { status: response.status },
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to stop Vision Agent session", error);

    return Response.json(
      { error: "Unable to stop the AI teacher session." },
      { status: 500 },
    );
  }
}
