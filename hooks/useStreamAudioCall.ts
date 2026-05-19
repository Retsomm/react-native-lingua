import { getApiUrl } from "@/lib/api";
import type { Lesson, SupportedLanguage } from "@/types/learning";
import type {
  Call,
  StreamVideoClient,
  User,
} from "@stream-io/video-react-native-sdk";
import {
  StreamVideo,
  StreamVideoClient as StreamVideoClientClass,
} from "@stream-io/video-react-native-sdk";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

type AudioCallStatus =
  | "idle"
  | "starting"
  | "connecting-agent"
  | "ready"
  | "joining"
  | "joined"
  | "muting"
  | "ending"
  | "ended"
  | "error";

type AudioCallResponse = {
  apiKey: string;
  callCid: string;
  callId: string;
  callType: string;
  token: string;
  user: {
    id: string;
    image: string | null;
    name: string;
  };
};

type AgentSessionResponse = {
  sessionId: string;
};

type StreamVideoProvider = ComponentType<{
  children: ReactNode;
  client: StreamVideoClient;
}>;

type UseStreamAudioCallArgs = {
  language?: SupportedLanguage;
  lesson: Lesson;
  user:
    | {
        fullName: string | null;
        id: string;
        imageUrl: string;
        primaryEmailAddress?: {
          emailAddress: string;
        } | null;
      }
    | null
    | undefined;
};

type JoinCallOptions = {
  cameraEnabled?: boolean;
  muted?: boolean;
};

function isAudioCallResponse(
  data: AudioCallResponse | { error?: string },
): data is AudioCallResponse {
  return "apiKey" in data && "token" in data && "user" in data;
}

function isAgentSessionResponse(
  data: AgentSessionResponse | { error?: string },
): data is AgentSessionResponse {
  return "sessionId" in data;
}

export function useStreamAudioCall({
  language,
  lesson,
  user,
}: UseStreamAudioCallArgs) {
  const [agentSessionId, setAgentSessionId] = useState<string | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<AudioCallStatus>("idle");
  const [StreamVideoProvider, setStreamVideoProvider] =
    useState<StreamVideoProvider | null>(null);
  const [streamUser, setStreamUser] = useState<AudioCallResponse["user"] | null>(
    null,
  );
  const agentSessionRef = useRef<{
    callId: string;
    sessionId: string;
  } | null>(null);

  const clerkUserName = useMemo(() => {
    if (!user) {
      return null;
    }

    return user.fullName ?? user.primaryEmailAddress?.emailAddress ?? user.id;
  }, [user]);

  const startCall = useCallback(async () => {
    if (!user) {
      setErrorMessage("Sign in before starting an audio lesson.");
      setStatus("error");
      return null;
    }

    setErrorMessage(null);
    setStatus("starting");

    let streamCall: Call | null = null;
    let streamClient: StreamVideoClient | null = null;
    let nextAgentSession:
      | {
          callId: string;
          sessionId: string;
        }
      | null = null;
    let isStreamClientConnected = false;

    try {
      const response = await fetch(getApiUrl("/api/stream/audio-call"), {
        body: JSON.stringify({
          languageId: language?.id ?? lesson.languageId,
          languageName: language?.name,
          lesson: {
            activities: lesson.activities,
            aiTeacherPrompt: lesson.aiTeacherPrompt,
            description: lesson.description,
            goals: lesson.goals,
            phrases: lesson.phrases,
            vocabulary: lesson.vocabulary,
          },
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          user: {
            id: user.id,
            image: user.imageUrl,
            name: clerkUserName,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data = (await response.json()) as
        | AudioCallResponse
        | { error?: string };

      if (!response.ok || !isAudioCallResponse(data)) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Unable to create audio session.",
        );
      }

      const streamUserData: User = {
        id: data.user.id,
        image: data.user.image ?? undefined,
        name: data.user.name,
      };
      await call?.leave().catch(() => undefined);
      await client?.disconnectUser().catch(() => undefined);

      streamClient = new StreamVideoClientClass(data.apiKey);
      await streamClient.connectUser(streamUserData, data.token);
      isStreamClientConnected = true;
      streamCall = streamClient.call(data.callType, data.callId);

      await streamCall.camera.disable();
      setStatus("connecting-agent");

      const agentResponse = await fetch(getApiUrl("/api/vision-agent/session"), {
        body: JSON.stringify({
          callId: data.callId,
          callType: data.callType,
          languageId: language?.id ?? lesson.languageId,
          languageName: language?.name,
          lesson: {
            activities: lesson.activities,
            aiTeacherPrompt: lesson.aiTeacherPrompt,
            description: lesson.description,
            goals: lesson.goals,
            phrases: lesson.phrases,
            vocabulary: lesson.vocabulary,
          },
          lessonId: lesson.id,
          lessonTitle: lesson.title,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const agentData = (await agentResponse.json()) as
        | AgentSessionResponse
        | { error?: string };

      if (!agentResponse.ok || !isAgentSessionResponse(agentData)) {
        throw new Error(
          "error" in agentData && agentData.error
            ? agentData.error
            : "Unable to connect the AI teacher.",
        );
      }

      nextAgentSession = {
        callId: data.callId,
        sessionId: agentData.sessionId,
      };
      agentSessionRef.current = nextAgentSession;
      setStreamVideoProvider(() => StreamVideo);
      setAgentSessionId(agentData.sessionId);
      setClient(streamClient);
      setCall(streamCall);
      setStreamUser(data.user);
      setIsCameraOn(false);
      setIsMuted(false);
      setStatus("ready");

      return streamCall;
    } catch (error) {
      if (nextAgentSession) {
        await stopAgentSession(nextAgentSession).catch(() => undefined);
      }

      await streamCall?.leave().catch(() => undefined);

      if (isStreamClientConnected) {
        await streamClient?.disconnectUser().catch(() => undefined);
      }

      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create audio session.",
      );
      setStatus("error");
      return null;
    }
  }, [call, clerkUserName, client, language, lesson, user]);

  const joinCall = useCallback(async (options: JoinCallOptions = {}) => {
    const activeCall = call ?? (await startCall());

    if (!activeCall) {
      return;
    }

    setErrorMessage(null);
    setStatus("joining");

    try {
      if (options.cameraEnabled) {
        await activeCall.camera.enable();
      } else {
        await activeCall.camera.disable();
      }

      if (options.muted) {
        await activeCall.microphone.disable();
      } else {
        await activeCall.microphone.enable();
      }

      await activeCall.join();
      setIsCameraOn(Boolean(options.cameraEnabled));
      setIsMuted(Boolean(options.muted));
      setStatus("joined");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to join audio call.",
      );
      setStatus("error");
    }
  }, [call, startCall]);

  const toggleMute = useCallback(async () => {
    if (status !== "joined") {
      await joinCall({ muted: true });
      return;
    }

    if (!call) {
      return;
    }

    const nextMuted = !isMuted;
    setStatus("muting");

    try {
      if (nextMuted) {
        await call.microphone.disable();
      } else {
        await call.microphone.enable();
      }

      setIsMuted(nextMuted);
      setStatus("joined");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update microphone.",
      );
      setStatus("error");
    }
  }, [call, isMuted, joinCall, status]);

  const toggleCamera = useCallback(async () => {
    if (status !== "joined") {
      await joinCall({ cameraEnabled: true });
      return;
    }

    if (!call) {
      return;
    }

    const nextCameraOn = !isCameraOn;
    setStatus("muting");

    try {
      if (nextCameraOn) {
        await call.camera.enable();
      } else {
        await call.camera.disable();
      }

      setIsCameraOn(nextCameraOn);
      setStatus("joined");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update camera.",
      );
      setStatus("error");
    }
  }, [call, isCameraOn, joinCall, status]);

  const endCall = useCallback(async () => {
    const currentAgentSession = agentSessionRef.current;

    if (currentAgentSession) {
      await stopAgentSession(currentAgentSession).catch(() => undefined);
      agentSessionRef.current = null;
      setAgentSessionId(null);
    }

    if (!call) {
      setStatus("ended");
      return;
    }

    setStatus("ending");

    try {
      await call.endCall();
      await call.leave().catch(() => undefined);
      await client?.disconnectUser().catch(() => undefined);
      setCall(null);
      setClient(null);
      setIsCameraOn(false);
      setIsMuted(false);
      setStatus("ended");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to end audio call.",
      );
      setStatus("error");
    }
  }, [call, client]);

  useEffect(() => {
    return () => {
      call?.leave().catch(() => undefined);
    };
  }, [call]);

  useEffect(() => {
    return () => {
      client?.disconnectUser().catch(() => undefined);
    };
  }, [client]);

  useEffect(() => {
    return () => {
      const currentAgentSession = agentSessionRef.current;

      if (currentAgentSession) {
        stopAgentSession(currentAgentSession).catch(() => undefined);
        agentSessionRef.current = null;
      }
    };
  }, []);

  return {
    call,
    client,
    endCall,
    agentSessionId,
    errorMessage,
    isCameraOn,
    isMuted,
    joinCall,
    startCall,
    status,
    StreamVideoProvider,
    streamUser,
    toggleCamera,
    toggleMute,
  };
}

async function stopAgentSession(session: { callId: string; sessionId: string }) {
  await fetch(getApiUrl("/api/vision-agent/session"), {
    body: JSON.stringify(session),
    headers: {
      "Content-Type": "application/json",
    },
    method: "DELETE",
  });
}
