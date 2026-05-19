import { StreamClient } from "@stream-io/node-sdk";

type AudioCallRequest = {
  languageId?: string;
  languageName?: string;
  lessonId?: string;
  lessonTitle?: string;
  user?: {
    id?: string;
    image?: string | null;
    name?: string | null;
  };
};

const callType = "default";

function cleanId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function compactId(value: string, maxLength: number) {
  const cleaned = cleanId(value);

  return cleaned.slice(0, maxLength);
}

function getStreamClient() {
  const apiKey = process.env.STREAM_API_KEY;
  const apiSecret = process.env.STREAM_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Missing STREAM_API_KEY or STREAM_API_SECRET");
  }

  return {
    apiKey,
    client: new StreamClient(apiKey, apiSecret, { timeout: 15000 }),
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AudioCallRequest;
    const lessonId = body.lessonId?.trim();
    const languageId = body.languageId?.trim();
    const userId = body.user?.id?.trim();

    if (!lessonId || !languageId || !userId) {
      return Response.json(
        { error: "lessonId, languageId, and user.id are required." },
        { status: 400 },
      );
    }

    const { apiKey, client } = getStreamClient();
    const safeUserId = cleanId(userId);
    const safeLessonId = compactId(lessonId, 18);
    const safeLanguageId = compactId(languageId, 10);
    const safeUserSegment = compactId(userId, 12);
    const uniqueSegment = crypto.randomUUID().replaceAll("-", "").slice(0, 12);
    const callId = [
      "lesson",
      safeLanguageId,
      safeLessonId,
      safeUserSegment,
      uniqueSegment,
    ].join("-");
    const callCid = `${callType}:${callId}`;

    await client.upsertUsers([
      {
        id: safeUserId,
        image: body.user?.image ?? undefined,
        name: body.user?.name ?? "Language learner",
        role: "user",
      },
    ]);

    const call = client.video.call(callType, callId);
    await call.getOrCreate({
      video: true,
      data: {
        created_by_id: safeUserId,
        custom: {
          languageId,
          languageName: body.languageName ?? languageId,
          lessonId,
          lessonTitle: body.lessonTitle ?? lessonId,
          mode: "video-lesson",
        },
        members: [{ role: "call_member", user_id: safeUserId }],
        video: true,
      },
    });

    const token = client.generateCallToken({
      call_cids: [callCid],
      user_id: safeUserId,
      validity_in_seconds: 60 * 60,
    });

    return Response.json({
      apiKey,
      callCid,
      callId,
      callType,
      token,
      user: {
        id: safeUserId,
        image: body.user?.image ?? null,
        name: body.user?.name ?? "Language learner",
      },
    });
  } catch (error) {
    console.error("Failed to create Stream audio call", error);

    return Response.json(
      { error: "Unable to create audio call." },
      { status: 500 },
    );
  }
}
