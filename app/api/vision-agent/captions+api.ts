type CaptionResponse = {
  captions?: {
    createdAt?: number;
    id?: string;
    role?: "assistant" | "user";
    speakerId?: string;
    text?: string;
  }[];
};

const VISION_AGENT_TIMEOUT_MS = Number(
  process.env.VISION_AGENT_TIMEOUT_MS ?? 30_000,
);

function getVisionAgentBaseUrl() {
  const baseUrl = process.env.VISION_AGENT_BASE_URL?.replace(/\/+$/, "");

  if (!baseUrl) {
    throw new Error("Missing VISION_AGENT_BASE_URL");
  }

  return baseUrl;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const callId = url.searchParams.get("callId");
    const after = url.searchParams.get("after") ?? "0";

    if (!callId) {
      return Response.json({ error: "callId is required." }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, VISION_AGENT_TIMEOUT_MS);

    try {
      const response = await fetch(
        `${getVisionAgentBaseUrl()}/calls/${encodeURIComponent(callId)}/captions?after=${encodeURIComponent(after)}`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        return Response.json(
          { error: "Unable to load live captions." },
          { status: response.status },
        );
      }

      const data = (await response.json()) as CaptionResponse;

      return Response.json({ captions: data.captions ?? [] });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error("Failed to load Vision Agent captions", error);

    return Response.json(
      { error: "Unable to load live captions." },
      { status: 500 },
    );
  }
}
