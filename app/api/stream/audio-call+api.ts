import { StreamClient } from "@stream-io/node-sdk";
import type { LessonActivity, PhraseItem, VocabularyItem } from "@/types/learning";

type AudioCallRequest = {
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
  user?: {
    id?: string;
    image?: string | null;
    name?: string | null;
  };
};

const callType = "audio_room";
const agentUserId = "lingua-ai-teacher";

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

function getInvalidIdentifierError(
  identifiers: { name: string; value: string }[],
) {
  const invalidIdentifier = identifiers.find(({ value }) => !value);

  if (!invalidIdentifier) {
    return null;
  }

  return `Invalid ${invalidIdentifier.name}: identifier is empty after sanitization.`;
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
    const invalidIdentifierError = getInvalidIdentifierError([
      { name: "user.id", value: safeUserId },
      { name: "lessonId", value: safeLessonId },
      { name: "languageId", value: safeLanguageId },
      { name: "user.id", value: safeUserSegment },
    ]);

    if (invalidIdentifierError) {
      return Response.json({ error: invalidIdentifierError }, { status: 400 });
    }

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
      {
        id: agentUserId,
        name: "Lingua AI Teacher",
        role: "admin",
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
          language: {
            id: languageId,
            name: body.languageName ?? languageId,
          },
          lesson: {
            ...(body.lesson ?? {}),
            id: lessonId,
            title: body.lessonTitle ?? lessonId,
          },
          lessonId,
          lessonTitle: body.lessonTitle ?? lessonId,
          mode: "audio-lesson",
        },
        members: [
          { role: "call_member", user_id: safeUserId },
          { role: "admin", user_id: agentUserId },
        ],
        video: true,
      },
    });
    await call.goLive();

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
