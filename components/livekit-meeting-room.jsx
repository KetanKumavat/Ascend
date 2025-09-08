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
} from "livekit-client";
import "@livekit/components-styles";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Users, Clock } from "lucide-react";
import { toast } from "sonner";

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
    const [isTranscribing, setIsTranscribing] = useState(true); // Auto-enabled
    const [startTime, setStartTime] = useState(null);
    const [transcriptionStarted, setTranscriptionStarted] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [transcript, setTranscript] = useState("");

    const formatDuration = (start) => {
        if (!start) return "00:00";
        const duration = new Date() - start;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
    };

    const [currentTime, setCurrentTime] = useState(formatDuration(startTime));

    // Update timer every second
    useEffect(() => {
        if (!startTime) return;

        const interval = setInterval(() => {
            setCurrentTime(formatDuration(startTime));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    // Initialize speech recognition for transcription
    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            ("webkitSpeechRecognition" in window ||
                "SpeechRecognition" in window)
        ) {
            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();

            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = "en-US";

            recognitionInstance.onstart = () => {
                console.log("Speech recognition started");
            };

            recognitionInstance.onresult = (event) => {
                let finalTranscript = "";
                let interimTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    console.log("Final transcript:", finalTranscript);
                    setTranscript((prev) => prev + " " + finalTranscript);
                    // Save transcript to backend
                    saveTranscriptSegment(finalTranscript);
                    toast.success("Transcribing...", { duration: 1000 });
                }
            };

            recognitionInstance.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                if (event.error === "not-allowed") {
                    toast.error(
                        "Microphone access denied. Please allow microphone access for transcription."
                    );
                    setIsTranscribing(false);
                    setTranscriptionStarted(false);
                } else if (event.error === "network") {
                    toast.error("Network error. Transcription paused.");
                    // Try to restart recognition
                    setTimeout(() => {
                        if (transcriptionStarted && recognition) {
                            try {
                                recognition.start();
                            } catch (e) {
                                console.error("Failed to restart recognition:", e);
                            }
                        }
                    }, 2000);
                } else if (event.error === "no-speech") {
                    console.log("No speech detected, continuing...");
                } else {
                    console.error("Recognition error:", event.error);
                }
            };

            recognitionInstance.onend = () => {
                console.log("Speech recognition ended");
                // Restart if we're still supposed to be transcribing
                if (transcriptionStarted && isTranscribing) {
                    setTimeout(() => {
                        try {
                            recognitionInstance.start();
                        } catch (e) {
                            console.error("Failed to restart recognition:", e);
                        }
                    }, 100);
                }
            };

            setRecognition(recognitionInstance);
        } else {
            console.warn("Speech recognition not supported in this browser");
            setIsTranscribing(false);
            toast.warning("Speech recognition not supported in this browser");
        }
    }, []);

    // Hide main website header when in meeting
    useEffect(() => {
        const header = document.querySelector("header");
        if (header) {
            header.style.display = "none";
        }

        return () => {
            if (header) {
                header.style.display = "flex";
            }
        };
    }, []);

    // Helper function to get human-readable disconnect reason
    const getDisconnectReasonText = (reason) => {
        switch (reason) {
            case DisconnectReason.CLIENT_INITIATED:
                return "You left the meeting";
            case DisconnectReason.DUPLICATE_IDENTITY:
                return "Connection conflict detected - reconnecting...";
            case DisconnectReason.SERVER_SHUTDOWN:
                return "Server maintenance";
            case DisconnectReason.PARTICIPANT_REMOVED:
                return "You were removed from the meeting";
            case DisconnectReason.ROOM_DELETED:
                return "Meeting was ended";
            case DisconnectReason.STATE_MISMATCH:
                return "Connection state error - reconnecting...";
            case DisconnectReason.JOIN_FAILURE:
                return "Failed to join meeting";
            default:
                return "Connection lost - reconnecting...";
        }
    };

    // Initialize room connection
    useEffect(() => {
        if (!token || !serverUrl) return;

        let isConnecting = false;
        let isMounted = true;

        const room = new Room({
            // automatically manage subscribed video quality
            adaptiveStream: true,
            // optimize publishing bandwidth and CPU for mobile
            dynacast: true,
            // configure connection timeouts
            connectionTimeout: 8000,
            // Prevent disconnection when other participants join/leave
            autoSubscribe: true,
            // Keep connection stable
            reconnectPolicy: {
                maxReconnectAttempts: 3,
                initialDelay: 1000,
                maxDelay: 8000,
                backoffFactor: 1.5,
            },
            // Improve connection reliability
            publishDefaults: {
                videoSimulcastLayers: [
                    {
                        resolution: { width: 320, height: 240 },
                        encoding: { maxBitrate: 150_000 },
                    },
                    {
                        resolution: { width: 640, height: 480 },
                        encoding: { maxBitrate: 400_000 },
                    },
                ],
                audioBitrate: 64_000,
            },
        });

        // Set up room event listeners
        room.on(RoomEvent.Connected, () => {
            if (!isMounted) return;
            console.log("Connected to LiveKit room");
            setConnectionState(ConnectionState.Connected);
            setStartTime(new Date());
            toast.success("Connected to meeting");

            // Update meeting status to IN_PROGRESS
            updateMeetingStatus("IN_PROGRESS");

            // Auto-start transcription after a short delay
            setTimeout(() => {
                if (!transcriptionStarted && recognition) {
                    startTranscription();
                }
            }, 2000);
        });

        room.on(RoomEvent.Reconnecting, () => {
            if (!isMounted) return;
            console.log("Reconnecting to LiveKit room");
            setConnectionState(ConnectionState.Reconnecting);
            toast.info("Reconnecting to meeting...");
        });

        room.on(RoomEvent.Reconnected, () => {
            if (!isMounted) return;
            console.log("Reconnected to LiveKit room");
            setConnectionState(ConnectionState.Connected);
            toast.success("Reconnected to meeting");
        });

        room.on(RoomEvent.Disconnected, (reason) => {
            if (!isMounted) return;
            console.log("Disconnected from LiveKit room, reason:", reason);
            setConnectionState(ConnectionState.Disconnected);

            // Handle different disconnect reasons
            if (reason === DisconnectReason.CLIENT_INITIATED) {
                // User initiated disconnect - don't reconnect
                return;
            } else if (
                reason === DisconnectReason.DUPLICATE_IDENTITY ||
                reason === DisconnectReason.STATE_MISMATCH
            ) {
                // Identity conflict or state mismatch - let LiveKit auto-reconnect
                const reasonText = getDisconnectReasonText(reason);
                console.log(`Temporary disconnection: ${reasonText}`);
                toast.info(reasonText);
                // Don't end the meeting, just let it reconnect
            } else if (
                reason === DisconnectReason.ROOM_DELETED ||
                reason === DisconnectReason.PARTICIPANT_REMOVED
            ) {
                // Meeting actually ended
                const reasonText = getDisconnectReasonText(reason);
                console.log(`Meeting ended: ${reasonText}`);
                toast.error(`Meeting ended: ${reasonText}`);
                if (onMeetingEnd) {
                    onMeetingEnd();
                }
                updateMeetingStatus("COMPLETED");
            } else {
                // Other network issues - show info and let auto-reconnect
                const reasonText = getDisconnectReasonText(reason);
                toast.info(reasonText);
            }
        });

        room.on(RoomEvent.ParticipantConnected, (participant) => {
            if (!isMounted) return;
            console.log("Participant connected:", participant.name);
            setParticipants((prev) => {
                // Avoid duplicates
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
            console.log("Participant disconnected:", participant.name);
            setParticipants((prev) =>
                prev.filter((p) => p.sid !== participant.sid)
            );
            toast.info(`${participant.name || "Someone"} left the meeting`);
        });

        // Handle data messages (for transcription)
        room.on(RoomEvent.DataReceived, (payload, participant) => {
            if (!isMounted) return;
            try {
                const data = JSON.parse(new TextDecoder().decode(payload));
                if (data.type === "transcript" && onTranscriptUpdate) {
                    onTranscriptUpdate(data);
                }
            } catch (error) {
                console.error("Error parsing data message:", error);
            }
        });

        setRoom(room);

        // Prevent double connection in React Strict Mode
        if (!isConnecting) {
            isConnecting = true;
            setConnectionState(ConnectionState.Connecting);

            const connectWithRetry = async (retryCount = 0) => {
                try {
                    console.log("Attempting to connect to LiveKit:", {
                        serverUrl,
                        tokenLength: token?.length,
                        meetingId,
                        attempt: retryCount + 1,
                    });
                    
                    // Ensure we're not already connected
                    if (room.state === "connected") {
                        console.log("Already connected, skipping connection attempt");
                        return;
                    }
                    
                    await room.connect(serverUrl, token);
                } catch (error) {
                    if (!isMounted) return;

                    console.error("Failed to connect to room:", error);

                    // Only retry for specific errors and limit retries
                    if (retryCount < 2 && (
                        error.message.includes("network") ||
                        error.message.includes("timeout") ||
                        error.message.includes("connection") ||
                        error.message.includes("WebSocket")
                    )) {
                        console.log(`Retrying connection (attempt ${retryCount + 2}/3)...`);
                        toast.info(`Retrying connection (${retryCount + 2}/3)...`);
                        setTimeout(() => connectWithRetry(retryCount + 1), 1500);
                    } else {
                        console.error("Connection failed permanently:", error.message);
                        toast.error(`Failed to connect to meeting: ${error.message}`);
                        setConnectionState(ConnectionState.Disconnected);
                    }
                }
            };

            connectWithRetry();
        }

        // Cleanup on unmount
        return () => {
            isMounted = false;
            isConnecting = false;
            
            // Properly cleanup room connection
            if (room) {
                try {
                    if (room.state === "connected" || room.state === "connecting") {
                        room.disconnect(true); // Force disconnect
                    }
                } catch (error) {
                    console.warn("Error during room cleanup:", error);
                }
            }
            
            // Cleanup transcription
            if (recognition && transcriptionStarted) {
                try {
                    recognition.stop();
                } catch (error) {
                    console.warn("Error stopping transcription:", error);
                }
            }
        };
    }, [
        token,
        serverUrl,
        meetingId,
        onMeetingEnd,
        onTranscriptUpdate,
        recognition,
        transcriptionStarted,
    ]);

    // Update meeting status
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

    // Start transcription with browser Speech Recognition API
    const startTranscription = async () => {
        if (!recognition || transcriptionStarted) return;

        try {
            // Request microphone permissions first
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    await navigator.mediaDevices.getUserMedia({ audio: true });
                    console.log("Microphone permission granted");
                } catch (permError) {
                    console.error("Microphone permission denied:", permError);
                    toast.error("Microphone access is required for transcription. Please allow microphone access.");
                    setIsTranscribing(false);
                    return;
                }
            }

            setTranscriptionStarted(true);
            recognition.start();
            console.log("Transcription started successfully");
            toast.success("AI transcription started - speak to see live text!");
        } catch (error) {
            console.error("Failed to start transcription:", error);
            setTranscriptionStarted(false);
            setIsTranscribing(false);
            toast.error("Failed to start transcription. Please check microphone permissions.");
        }
    };

    // Stop transcription
    const stopTranscription = async () => {
        if (!recognition || !transcriptionStarted) return;

        try {
            recognition.stop();
            setTranscriptionStarted(false);
            setIsTranscribing(false);
            console.log("Transcription stopped");
        } catch (error) {
            console.error("Failed to stop transcription:", error);
        }
    };

    // Save transcript segment to backend
    const saveTranscriptSegment = async (text) => {
        if (!text.trim()) return;

        try {
            await fetch(`/api/meetings/${meetingId}/transcript/autosave`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: text,
                    timestamp: new Date().toISOString(),
                    speaker: "participant", // Could be enhanced to identify speakers
                }),
            });
        } catch (error) {
            console.error("Failed to save transcript:", error);
        }
    };

    // Leave meeting
    const leaveMeeting = async () => {
        try {
            if (room) {
                await room.disconnect();
            }
            // Update meeting status
            await updateMeetingStatus("COMPLETED");
            toast.info("Left meeting");

            // Redirect to meeting details page
            if (onMeetingEnd) {
                onMeetingEnd();
            } else {
                window.location.href = `/meeting/${meetingId}`;
            }
        } catch (error) {
            console.error("Error leaving meeting:", error);
            // Force redirect even if there's an error
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

    // Main meeting room render

    return (
        <div className="fixed inset-0 bg-black z-[9999]">
            {/* Meeting Header - Compact floating overlay */}
            <div className="absolute top-4 left-4 right-4 z-10">
                <Card className="bg-black/80 backdrop-blur-md border-gray-600">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
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
                                    {isTranscribing && (
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1.5 bg-green-500/20 border-green-500 text-green-400 text-sm px-3 py-1"
                                        >
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            AI Transcription
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <Button
                                onClick={leaveMeeting}
                                variant="destructive"
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-sm px-4 py-2"
                            >
                                Leave Meeting
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* LiveKit Video Conference - Fullscreen with proper spacing */}
            <div className="w-full h-full pt-20 pb-4 px-4">
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
                        options={{
                            publishDefaults: {
                                videoSimulcastLayers: [
                                    {
                                        resolution: { width: 640, height: 360 },
                                        encoding: {
                                            maxBitrate: 600_000,
                                            maxFramerate: 20,
                                        },
                                    },
                                    {
                                        resolution: {
                                            width: 1280,
                                            height: 720,
                                        },
                                        encoding: {
                                            maxBitrate: 2_000_000,
                                            maxFramerate: 30,
                                        },
                                    },
                                ],
                            },
                        }}
                    >
                        <VideoConference
                            chatMessageFormatter={(msg) =>
                                `${msg.from?.name || "Anonymous"}: ${
                                    msg.message
                                }`
                            }
                        />
                        <RoomAudioRenderer />
                    </LiveKitRoom>
                </div>
            </div>
        </div>
    );
}
