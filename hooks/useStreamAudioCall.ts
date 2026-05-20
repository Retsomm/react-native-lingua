import { getApiUrl } from "@/lib/api";
import type { Lesson, SupportedLanguage } from "@/types/learning";
import type {
  Call,
  StreamVideoClient,
  User,
} from "@stream-io/video-client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { Platform } from "react-native";

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

type AgentConnectionStatus = "idle" | "connecting" | "connected" | "failed";
type CaptionStatus = "idle" | "starting" | "live" | "unavailable" | "error";
type LiveCaptionRole = "teacher" | "learner";

export type LiveCaption = {
  createdAt: number;
  id: string;
  role: LiveCaptionRole;
  speakerId: string;
  speakerName: string;
  text: string;
};

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

type AudioCallDescriptor = Pick<AudioCallResponse, "callId" | "callType">;

type AgentSessionResponse = {
  sessionId: string;
};

type CaptionsResponse = {
  captions?: BufferedCaption[];
};

type BufferedCaption = {
  createdAt?: number;
  id?: string;
  role?: "assistant" | "user";
  speakerId?: string;
  text?: string;
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

const maxCaptionHistory = 8;
const captionPollIntervalMs = 1000;

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

function isLiveCaptionEventPayload(
  value: Record<string, unknown>,
): value is {
  captionId?: string;
  role?: "assistant" | "user";
  speakerId?: string;
  text?: string;
  type: "lingua.live_caption";
} {
  return value.type === "lingua.live_caption" && typeof value.text === "string";
}

function getCustomEventPayload(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
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
  const [agentConnectionStatus, setAgentConnectionStatus] =
    useState<AgentConnectionStatus>("idle");
  const [captionErrorMessage, setCaptionErrorMessage] = useState<string | null>(
    null,
  );
  const [captionStatus, setCaptionStatus] = useState<CaptionStatus>("idle");
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [liveCaptions, setLiveCaptions] = useState<LiveCaption[]>([]);
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
  const callDescriptorRef = useRef<AudioCallDescriptor | null>(null);
  const captionUnsubscribeRef = useRef<(() => void) | null>(null);

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
    setCaptionErrorMessage(null);
    setCaptionStatus("idle");
    setLiveCaptions([]);
    setAgentConnectionStatus("idle");
    setStatus("starting");
    captionUnsubscribeRef.current?.();
    captionUnsubscribeRef.current = null;

    let streamCall: Call | null = null;
    let streamClient: StreamVideoClient | null = null;
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
      const currentAgentSession = agentSessionRef.current;

      if (currentAgentSession) {
        await stopAgentSession(currentAgentSession).catch(() => undefined);
        agentSessionRef.current = null;
        setAgentSessionId(null);
      }

      await call?.leave().catch(() => undefined);
      await client?.disconnectUser().catch(() => undefined);

      if (Platform.OS === "web") {
        const { StreamVideoClient: StreamVideoClientClass } = await import(
          "@stream-io/video-client"
        );

        streamClient = new StreamVideoClientClass(data.apiKey);
        setStreamVideoProvider(null);
      } else {
        const { StreamVideo, StreamVideoClient: StreamVideoClientClass } =
          await import("@stream-io/video-react-native-sdk");

        streamClient = new StreamVideoClientClass(data.apiKey);
        setStreamVideoProvider(() => StreamVideo);
      }

      await streamClient.connectUser(streamUserData, data.token);
      isStreamClientConnected = true;
      streamCall = streamClient.call(data.callType, data.callId);
      callDescriptorRef.current = {
        callId: data.callId,
        callType: data.callType,
      };
      setActiveCallId(data.callId);
      const addCustomCaption = (custom: unknown) => {
        const payload = getCustomEventPayload(custom);

        if (!payload || !isLiveCaptionEventPayload(payload)) {
          return;
        }

        setLiveCaptions((currentCaptions) =>
          getNextCustomEventCaptions(currentCaptions, payload),
        );
      };
      const callCustomEventUnsubscribe = streamCall.on("custom", (event) => {
        addCustomCaption(event.custom);
      });
      const clientCustomEventUnsubscribe = streamClient.on("custom", (event) => {
        if ("call_cid" in event && event.call_cid !== data.callCid) {
          return;
        }

        addCustomCaption(event.custom);
      });
      captionUnsubscribeRef.current = () => {
        callCustomEventUnsubscribe();
        clientCustomEventUnsubscribe();
      };

      await streamCall.camera.disable();
      setClient(streamClient);
      setCall(streamCall);
      setStreamUser(data.user);
      setIsCameraOn(false);
      setIsMuted(false);
      setStatus("ready");

      return streamCall;
    } catch (error) {
      await streamCall?.leave().catch(() => undefined);

      if (isStreamClientConnected) {
        await streamClient?.disconnectUser().catch(() => undefined);
      }

      streamCall = null;
      streamClient = null;
      isStreamClientConnected = false;
      agentSessionRef.current = null;
      callDescriptorRef.current = null;
      setActiveCallId(null);
      setAgentSessionId(null);
      setAgentConnectionStatus("failed");
      captionUnsubscribeRef.current?.();
      captionUnsubscribeRef.current = null;
      setCall(null);
      setClient(null);
      setCaptionStatus("error");
      setIsCameraOn(false);
      setIsMuted(false);

      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create audio session.",
      );
      setStatus("error");
      return null;
    }
  }, [call, clerkUserName, client, language, lesson, user]);

  const connectAgentSession = useCallback(async () => {
    const descriptor = callDescriptorRef.current;

    if (!descriptor || agentSessionRef.current) {
      return true;
    }

    setAgentConnectionStatus("connecting");

    try {
      const agentResponse = await fetch(getApiUrl("/api/vision-agent/session"), {
        body: JSON.stringify({
          callId: descriptor.callId,
          callType: descriptor.callType,
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

      agentSessionRef.current = {
        callId: descriptor.callId,
        sessionId: agentData.sessionId,
      };
      setAgentSessionId(agentData.sessionId);
      setAgentConnectionStatus("connected");
      return true;
    } catch (error) {
      setAgentConnectionStatus("failed");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to connect the AI teacher.",
      );
      return false;
    }
  }, [language, lesson]);

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

      setCaptionErrorMessage(null);
      setCaptionStatus("starting");

      const didConnectAgent = await connectAgentSession();

      if (didConnectAgent) {
        setCaptionStatus("live");
      } else {
        setCaptionErrorMessage("Unable to connect live transcript captions.");
        setCaptionStatus("error");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to join audio call.",
      );
      setStatus("error");
    }
  }, [call, connectAgentSession, startCall]);

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

  const setMicrophoneEnabled = useCallback(async (enabled: boolean) => {
    if (!call || status !== "joined") {
      return;
    }

    try {
      if (enabled) {
        await call.microphone.enable();
      } else {
        await call.microphone.disable();
      }

      setIsMuted(!enabled);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update microphone.",
      );
      setStatus("error");
    }
  }, [call, status]);

  const startSpeaking = useCallback(async () => {
    await setMicrophoneEnabled(true);
  }, [setMicrophoneEnabled]);

  const stopSpeaking = useCallback(async () => {
    await setMicrophoneEnabled(false);
  }, [setMicrophoneEnabled]);

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
      callDescriptorRef.current = null;
      setAgentSessionId(null);
      setAgentConnectionStatus("idle");
    }

    if (!call) {
      setStatus("ended");
      return;
    }

    setStatus("ending");

    let errorOccurred = false;

    try {
      await call.endCall();
    } catch (error) {
      errorOccurred = true;
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to end audio call.",
      );
      setStatus("error");
    } finally {
      await call.leave().catch(() => undefined);
      await client?.disconnectUser().catch(() => undefined);
      captionUnsubscribeRef.current?.();
      captionUnsubscribeRef.current = null;
      setCall(null);
      setClient(null);
      callDescriptorRef.current = null;
      setActiveCallId(null);
      setLiveCaptions([]);
      setCaptionStatus("idle");
      setIsCameraOn(false);
      setIsMuted(false);

      if (!errorOccurred) {
        setStatus("ended");
      }
    }
  }, [call, client]);

  useEffect(() => {
    return () => {
      call?.leave().catch(() => undefined);
      captionUnsubscribeRef.current?.();
      captionUnsubscribeRef.current = null;
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

      callDescriptorRef.current = null;
      setActiveCallId(null);
      captionUnsubscribeRef.current?.();
      captionUnsubscribeRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!activeCallId || !agentSessionId) {
      return;
    }

    const controller = new AbortController();

    const loadCaptions = async () => {
      let lastCaptionAt = 0;

      while (!controller.signal.aborted) {
        try {
          const response = await fetch(
            getApiUrl(
              `/api/vision-agent/captions?callId=${encodeURIComponent(activeCallId)}&after=${lastCaptionAt}`,
            ),
            { signal: controller.signal },
          );

          if (!response.ok) {
            await wait(1000, controller.signal);
            continue;
          }

          const data = (await response.json()) as CaptionsResponse;
          const captions = data.captions ?? [];

          if (captions.length > 0) {
            captions.forEach((caption) => {
              if (caption.createdAt && caption.createdAt > lastCaptionAt) {
                lastCaptionAt = caption.createdAt;
              }
            });

            setLiveCaptions((currentCaptions) =>
              captions.reduce(getNextBufferedCaption, currentCaptions),
            );
          }

          await wait(captionPollIntervalMs, controller.signal);
        } catch (error) {
          if (controller.signal.aborted) {
            return;
          }

          // Captions are best-effort and should never interrupt the lesson audio.
          await wait(captionPollIntervalMs, controller.signal);
        }
      }
    };

    loadCaptions();

    return () => {
      controller.abort();
    };
  }, [activeCallId, agentSessionId]);

  return {
    call,
    client,
    endCall,
    agentSessionId,
    agentConnectionStatus,
    captionErrorMessage,
    captionStatus,
    errorMessage,
    isCameraOn,
    isMuted,
    joinCall,
    liveCaptions,
    startCall,
    startSpeaking,
    status,
    stopSpeaking,
    StreamVideoProvider,
    streamUser,
    toggleCamera,
    toggleMute,
  };
}

function getNextCustomEventCaptions(
  currentCaptions: LiveCaption[],
  payload: {
    captionId?: string;
    role?: "assistant" | "user";
    speakerId?: string;
    text?: string;
  },
) {
  const text = payload.text?.trim();

  if (!text) {
    return currentCaptions;
  }

  const role: LiveCaptionRole = payload.role === "assistant" ? "teacher" : "learner";
  const liveCaption: LiveCaption = {
    createdAt: Date.now(),
    id: payload.captionId || `${payload.speakerId ?? role}-${Date.now()}`,
    role,
    speakerId: payload.speakerId ?? role,
    speakerName: role === "teacher" ? "AI Teacher" : "You",
    text,
  };
  const withoutCurrentCaption = currentCaptions.filter(
    (item) => item.id !== liveCaption.id,
  );

  return [...withoutCurrentCaption, liveCaption].slice(-maxCaptionHistory);
}

function getNextBufferedCaption(
  currentCaptions: LiveCaption[],
  caption: BufferedCaption,
) {
  return getNextCustomEventCaptions(currentCaptions, {
    ...caption,
    captionId: caption.id,
  });
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }

    const onAbort = () => {
      clearTimeout(timeout);
      resolve();
    };

    const timeout = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    signal.addEventListener(
      "abort",
      onAbort,
      { once: true },
    );
  });
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
