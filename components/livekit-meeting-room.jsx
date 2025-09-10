"use client";

import { useEffect, useState } from "react";
import {
    LiveKitRoom,
    VideoConference,
    RoomAudioRenderer,
} from "@livekit/components-react";
import {
    Room,
    RoomEvent,
    ConnectionState,
    DisconnectReason,
    Track,
} from "livekit-client";
import "@livekit/components-styles";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import "@livekit/components-styles";

export function LiveKitMeetingRoom({
    meetingId,
    meetingTitle,
    token,
    serverUrl,
    onMeetingEnd,
    onTranscriptUpdate,
}) {
    const [room, setRoom] = useState(null);
    const [connectionState, setConnectionState] = useState(
        ConnectionState.Disconnected
    );
    const [participants, setParticipants] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [transcriptionStatus, setTranscriptionStatus] = useState("Ready");
    const [agentActive, setAgentActive] = useState(false);
    const [currentTime, setCurrentTime] = useState("00:00");

    const formatDuration = (start) => {
        if (!start) return "00:00";
        const duration = new Date() - start;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(formatDuration(startTime));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime]);

    const startTranscriptionAgent = async () => {
        try {
            setTranscriptionStatus("Starting Transcription Agent...");
            const response = await fetch("/api/transcription/agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ meetingId, action: "start" }),
            });

            if (response.ok) {
                setAgentActive(true);
                setTranscriptionStatus("🤖 Recording Meeting");
                toast.success(
                    "Transcription agent started - meeting content will be recorded and processed"
                );
            }
        } catch (error) {
            console.error("Failed to start transcription agent:", error);
            setTranscriptionStatus("Agent failed");
            toast.error("Failed to start transcription agent");
        }
    };

    const stopTranscriptionAgent = async () => {
        try {
            setTranscriptionStatus("Stopping Transcription Agent...");
            await fetch("/api/transcription/agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ meetingId, action: "stop" }),
            });
            setAgentActive(false);
            setTranscriptionStatus("Recording Stopped");
            toast.info("Transcription agent stopped");
        } catch (error) {
            console.error("Failed to stop transcription agent:", error);
        }
    };

    useEffect(() => {
        const header = document.querySelector("header");
        if (header) header.style.display = "none";
        return () => {
            if (header) header.style.display = "flex";
        };
    }, []);

    const getDisconnectReasonText = (reason) => {
        switch (reason) {
            case DisconnectReason.CLIENT_INITIATED:
                return "You left the meeting";
            case DisconnectReason.DUPLICATE_IDENTITY:
                return "Connection conflict detected";
            case DisconnectReason.SERVER_SHUTDOWN:
                return "Server maintenance";
            case DisconnectReason.PARTICIPANT_REMOVED:
                return "You were removed from the meeting";
            case DisconnectReason.ROOM_DELETED:
                return "Meeting was ended";
            default:
                return "Connection lost";
        }
    };

    useEffect(() => {
        if (!token || !serverUrl) return;

        let isMounted = true;
        const room = new Room({
            adaptiveStream: true,
            dynacast: true,
            connectionTimeout: 8000,
            autoSubscribe: true,
            reconnectPolicy: {
                maxReconnectAttempts: 3,
                initialDelay: 1000,
                maxDelay: 8000,
                backoffFactor: 1.5,
            },
            publishDefaults: {
                audioBitrate: 64000,
                videoCodec: 'vp8',
                audioCodec: 'opus',
                simulcast: false, // Disable simulcast to avoid encoding issues
            },
        });

        room.on(RoomEvent.Connected, () => {
            if (!isMounted) return;
            setConnectionState(ConnectionState.Connected);
            setStartTime(new Date());
            toast.success("Connected to meeting");
            updateMeetingStatus("IN_PROGRESS");
            updateParticipantStatus("JOINED");

            setTimeout(() => {
                startTranscriptionAgent();
            }, 2000);
        });

        room.on(RoomEvent.Reconnecting, () => {
            if (!isMounted) return;
            setConnectionState(ConnectionState.Reconnecting);
            toast.info("Reconnecting to meeting...");
        });

        room.on(RoomEvent.Reconnected, () => {
            if (!isMounted) return;
            setConnectionState(ConnectionState.Connected);
            toast.success("Reconnected to meeting");
        });

        room.on(RoomEvent.Disconnected, (reason) => {
            if (!isMounted) return;
            setConnectionState(ConnectionState.Disconnected);

            if (reason === DisconnectReason.CLIENT_INITIATED) {
                if (onMeetingEnd) {
                    onMeetingEnd();
                } else {
                    window.location.href = `/meeting/${meetingId}`;
                }
                return;
            }

            if (
                reason === DisconnectReason.ROOM_DELETED ||
                reason === DisconnectReason.PARTICIPANT_REMOVED
            ) {
                const reasonText = getDisconnectReasonText(reason);
                toast.error(`Meeting ended: ${reasonText}`);
                updateMeetingStatus("COMPLETED");
                if (onMeetingEnd) {
                    onMeetingEnd();
                } else {
                    window.location.href = `/meeting/${meetingId}`;
                }
            } else {
                toast.info(getDisconnectReasonText(reason));
            }
        });

        room.on(RoomEvent.ParticipantConnected, (participant) => {
            if (!isMounted) return;
            setParticipants((prev) => {
                const exists = prev.find((p) => p.sid === participant.sid);
                if (exists) return prev;
                return [...prev, participant];
            });
            toast.success(
                `${participant.name || "Someone"} joined the meeting`
            );
        });

        room.on(RoomEvent.ParticipantDisconnected, (participant) => {
            if (!isMounted) return;
            setParticipants((prev) => {
                const newParticipants = prev.filter(
                    (p) => p.sid !== participant.sid
                );
                setTimeout(async () => {
                    if (room && room.remoteParticipants.size === 0) {
                        await checkAndCompleteIfEmpty();
                    }
                }, 1000);
                return newParticipants;
            });
            toast.info(`${participant.name || "Someone"} left the meeting`);
        });

        room.on(RoomEvent.DataReceived, (payload, participant) => {
            if (!isMounted) return;
            try {
                const data = JSON.parse(new TextDecoder().decode(payload));
                if (data.type === "transcript") {
                    setRealtimeTranscript((prev) => {
                        const newTranscript = `${data.speaker}: ${data.text}`;
                        return prev + (prev ? " " : "") + newTranscript;
                    });
                    if (onTranscriptUpdate) {
                        onTranscriptUpdate(data);
                    }
                }
            } catch (error) {
                console.error("Error parsing data message:", error);
            }
        });

        room.on(
            RoomEvent.TrackSubscribed,
            (track, publication, participant) => {
                if (!isMounted) return;
                console.log(`Track subscribed: ${track.kind} from ${participant.identity}`);
                if (track.kind === Track.Kind.Audio && agentActive) {
                    console.log(
                        `Audio track subscribed from ${participant.identity}, agent processing...`
                    );
                }
            }
        );

        room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
            if (!isMounted) return;
            console.log(`Track unsubscribed: ${track.kind} from ${participant.identity}`);
        });

        room.on(RoomEvent.TrackPublished, (publication, participant) => {
            if (!isMounted) return;
            console.log(`Track published: ${publication.kind} from ${participant.identity}`);
        });

        room.on(RoomEvent.TrackUnpublished, (publication, participant) => {
            if (!isMounted) return;
            console.log(`Track unpublished: ${publication.kind} from ${participant.identity}`);
        });

        room.on(RoomEvent.TrackPublishFailed, (error, track) => {
            if (!isMounted) return;
            console.error("Track publish failed:", error);
            toast.error(`Failed to share ${track.kind}: ${error.message}`);
        });

        room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
            if (!isMounted) return;
            if (participant?.identity && quality === 'poor') {
                console.warn(`Poor connection quality for ${participant.identity}`);
            }
        });

        setRoom(room);
        setConnectionState(ConnectionState.Connecting);

        const connectWithRetry = async (retryCount = 0) => {
            try {
                if (room.state === "connected") return;
                
                // Simple media permission check
                try {
                    await navigator.mediaDevices.getUserMedia({ 
                        video: true, 
                        audio: true
                    });
                } catch (mediaError) {
                    console.warn("Media permission error:", mediaError);
                    toast.error("Camera/microphone access denied. Please allow permissions and refresh.");
                }
                
                await room.connect(serverUrl, token);
            } catch (error) {
                if (!isMounted) return;
                console.error("Connection error:", error);
                if (
                    retryCount < 2 &&
                    (error.message.includes("network") ||
                        error.message.includes("timeout") ||
                        error.message.includes("connection") ||
                        error.message.includes("WebSocket"))
                ) {
                    setTimeout(
                        () => connectWithRetry(retryCount + 1),
                        1000 * (retryCount + 1)
                    );
                } else {
                    toast.error("Failed to connect to meeting: " + error.message);
                    setConnectionState(ConnectionState.Disconnected);
                }
            }
        };

        connectWithRetry();

        return () => {
            isMounted = false;
            if (agentActive) {
                stopTranscriptionAgent();
            }
            if (room) {
                try {
                    // Remove all event listeners first
                    room.removeAllListeners();
                    
                    // Disconnect if connected
                    if (
                        room.state === "connected" ||
                        room.state === "connecting"
                    ) {
                        room.disconnect();
                    }
                } catch (error) {
                    console.warn("Error during room cleanup:", error);
                }
            }
        };
    }, [token, serverUrl, meetingId, onMeetingEnd, onTranscriptUpdate]);

    const updateMeetingStatus = async (status) => {
        try {
            await fetch(`/api/meetings/${meetingId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
        } catch (error) {
            console.error("Failed to update meeting status:", error);
        }
    };

    const updateParticipantStatus = async (status) => {
        try {
            await fetch(`/api/meetings/${meetingId}/participants`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
        } catch (error) {
            console.error("Failed to update participant status:", error);
        }
    };

    const checkAndCompleteIfEmpty = async () => {
        try {
            const response = await fetch(
                `/api/meetings/${meetingId}/participants/count`
            );
            if (response.ok) {
                const data = await response.json();
                if (data.activeCount === 0) {
                    await updateMeetingStatus("COMPLETED");
                }
            }
        } catch (error) {
            console.error("Failed to check participant count:", error);
        }
    };

    const leaveMeeting = async () => {
        try {
            await updateParticipantStatus("LEFT");
            if (room) await room.disconnect();
            await checkAndCompleteIfEmpty();
            toast.info("Left meeting");
            if (onMeetingEnd) {
                onMeetingEnd();
            } else {
                window.location.href = `/meeting/${meetingId}`;
            }
        } catch (error) {
            console.error("Error leaving meeting:", error);
            window.location.href = `/meeting/${meetingId}`;
        }
    };

    if (!token || !serverUrl) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4 mx-auto" />
                        <h3 className="text-lg font-semibold mb-2">
                            Unable to Join Meeting
                        </h3>
                        <p className="text-muted-foreground">
                            Missing meeting access token. Please refresh and try
                            again.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (
        connectionState === ConnectionState.Connecting ||
        connectionState === ConnectionState.Reconnecting
    ) {
        const isReconnecting = connectionState === ConnectionState.Reconnecting;
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 mx-auto" />
                        <h3 className="text-lg font-semibold mb-2">
                            {isReconnecting
                                ? "Reconnecting to Meeting..."
                                : "Connecting to Meeting..."}
                        </h3>
                        <p className="text-muted-foreground">
                            {isReconnecting
                                ? "Re-establishing connection to"
                                : "Establishing connection to"}{" "}
                            {meetingTitle}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="fixed inset-0 bg-black z-[9999] min-h-screen">
            <div className="absolute top-2 left-2 right-2 md:top-4 md:left-4 md:right-4 z-10">
                <Card className="bg-black/80 backdrop-blur-md border-neutral-800">
                    <CardContent className="p-2 md:p-4">
                        {/* Mobile Layout */}
                        <div className="md:hidden">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center  gap-2 flex-1 min-w-0">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                                    <h1 className="text-sm font-semibold text-white truncate">
                                        {meetingTitle}
                                    </h1>
                                    <div className="flex items-center gap-1 text-xs text-gray-300 ml-2">
                                        <Users className="w-3 h-3" />
                                        <span>{participants.length + 1}</span>
                                    </div>
                                </div>
                                <Button
                                    onClick={leaveMeeting}
                                    variant="destructive"
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1 flex-shrink-0"
                                >
                                    Leave
                                </Button>
                            </div>
                        </div>
                        {/* Desktop Layout */}
                        <div className="hidden md:flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <h1 className="text-sm font-semibold text-white truncate max-w-64">
                                        {meetingTitle}
                                    </h1>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-300">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4" />
                                        <span>{participants.length + 1}</span>
                                    </div>
                                    {startTime && (
                                        <Badge
                                            variant="outline"
                                            className="flex items-center gap-1.5 bg-black/40 border-gray-500 text-white text-sm px-3 py-1"
                                        >
                                            <Clock className="w-4 h-4" />
                                            {currentTime}
                                        </Badge>
                                    )}
                                    {agentActive && (
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1.5 bg-green-500/20 border-green-500 text-green-400 text-sm px-3 py-1"
                                            title="Transcription agent recording meeting content"
                                        >
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            Recording
                                        </Badge>
                                    )}
                                    {!agentActive && (
                                        <Badge
                                            variant="outline"
                                            className="flex items-center gap-1.5 bg-gray-500/20 border-gray-500 text-gray-400 text-sm px-3 py-1"
                                            title="Transcription agent offline"
                                        >
                                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                            Not Recording
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!agentActive && (
                                    <Button
                                        onClick={startTranscriptionAgent}
                                        variant="outline"
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white border-green-600 text-sm px-3 py-2"
                                    >
                                        Start Recording
                                    </Button>
                                )}
                                {agentActive && (
                                    <Button
                                        onClick={stopTranscriptionAgent}
                                        variant="outline"
                                        size="sm"
                                        className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 text-sm px-3 py-2"
                                    >
                                        Stop Recording
                                    </Button>
                                )}
                                <Button
                                    onClick={leaveMeeting}
                                    variant="destructive"
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 text-sm px-4 py-2"
                                >
                                    Leave Meeting
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="w-full h-full pt-16 md:pt-20 pb-4 px-2 md:px-4">
                <div className="w-full h-full max-w-7xl mx-auto">
                    <LiveKitRoom
                        video={true}
                        audio={true}
                        token={token}
                        serverUrl={serverUrl}
                        data-lk-theme="default"
                        className="h-full w-full rounded-lg overflow-hidden"
                        style={{
                            height: "100%",
                            width: "100%",
                            backgroundColor: "#000",
                        }}
                        room={room}
                        onError={(error) => {
                            console.error("LiveKit error:", error);
                            toast.error("Camera/microphone error: " + error.message);
                        }}
                        onDisconnected={() => {
                            console.log("LiveKitRoom disconnected");
                        }}
                    >
                        <div className="h-full w-full">
                            <VideoConference
                                chatMessageFormatter={(msg) =>
                                    `${msg.from?.name || "Anonymous"}: ${
                                        msg.message
                                    }`
                                }
                            />
                            <RoomAudioRenderer />
                        </div>
                    </LiveKitRoom>
                </div>
            </div>
        </div>
    );
}
