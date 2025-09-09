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
    const [transcriptionStatus, setTranscriptionStatus] =
        useState("Starting...");

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
        console.log("Initializing speech recognition...");
        if (
            typeof window !== "undefined" &&
            ("webkitSpeechRecognition" in window ||
                "SpeechRecognition" in window)
        ) {
            console.log("Speech recognition is supported");
            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();

            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = "en-US";

            console.log("Speech recognition configured:", {
                continuous: recognitionInstance.continuous,
                interimResults: recognitionInstance.interimResults,
                lang: recognitionInstance.lang,
            });

            recognitionInstance.onstart = () => {
                console.log("Speech recognition started");
                setTranscriptionStatus("🎤 Listening...");
                toast.info("🎤 Listening for speech...");
            };

            recognitionInstance.onresult = (event) => {
                console.log("Speech recognition result received", event);
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

                if (interimTranscript) {
                    console.log("Interim transcript:", interimTranscript);
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
                    console.log(
                        "Speech recognition network error - this is often a browser service issue, not your network"
                    );
                    setTranscriptionStatus("⚠️ Browser service issue");

                    // Don't show a toast immediately, just log it
                    console.log(
                        "Will attempt to restart speech recognition..."
                    );

                    // Try to restart recognition after a delay
                    setTimeout(() => {
                        if (
                            transcriptionStarted &&
                            recognition &&
                            isTranscribing
                        ) {
                            try {
                                console.log(
                                    "Attempting to restart recognition after browser service issue"
                                );
                                recognition.start();
                                setTranscriptionStatus("🎤 Listening...");
                            } catch (error) {
                                console.error(
                                    "Failed to restart recognition after network error:",
                                    error
                                );
                                setTranscriptionStatus(
                                    "❌ Service unavailable"
                                );
                                // Only show toast if multiple restarts fail
                                setTimeout(() => {
                                    if (
                                        transcriptionStarted &&
                                        recognition &&
                                        isTranscribing
                                    ) {
                                        try {
                                            recognition.start();
                                        } catch (e) {
                                            console.error(
                                                "Final restart attempt failed:",
                                                e
                                            );
                                            toast.warning(
                                                "Speech recognition service having issues. You can manually restart if needed."
                                            );
                                        }
                                    }
                                }, 5000);
                            }
                        }
                    }, 1000);
                } else if (event.error === "no-speech") {
                    console.log("No speech detected, continuing...");
                    // Don't show error for no-speech, it's normal
                } else if (event.error === "aborted") {
                    console.log(
                        "Speech recognition aborted (normal during restart)"
                    );
                    // Don't show error for aborted, it's normal during restarts
                } else if (event.error === "audio-capture") {
                    setTranscriptionStatus("❌ Audio error");
                    toast.error(
                        "Audio capture error. Please check your microphone."
                    );
                    setIsTranscribing(false);
                    setTranscriptionStarted(false);
                } else if (event.error === "service-not-allowed") {
                    setTranscriptionStatus("❌ Service unavailable");
                    toast.error(
                        "Speech recognition service not available. Please try again later."
                    );
                    setIsTranscribing(false);
                    setTranscriptionStarted(false);
                } else {
                    console.error("Unhandled recognition error:", event.error);
                    setTranscriptionStatus(`⚠️ ${event.error}`);
                    toast.warning(
                        `Speech recognition issue: ${event.error}. Continuing...`
                    );
                }
            };

            recognitionInstance.onend = () => {
                console.log("Speech recognition ended");
                // Restart if we're still supposed to be transcribing
                if (transcriptionStarted && isTranscribing) {
                    console.log("Attempting to restart speech recognition...");
                    setTimeout(() => {
                        try {
                            if (
                                recognitionInstance &&
                                transcriptionStarted &&
                                isTranscribing
                            ) {
                                recognitionInstance.start();
                                console.log(
                                    "Speech recognition restarted successfully"
                                );
                            }
                        } catch (e) {
                            console.error("Failed to restart recognition:", e);
                            // Try again with longer delay if restart fails
                            setTimeout(() => {
                                try {
                                    if (
                                        recognitionInstance &&
                                        transcriptionStarted &&
                                        isTranscribing
                                    ) {
                                        recognitionInstance.start();
                                        console.log(
                                            "Speech recognition restarted after retry"
                                        );
                                    }
                                } catch (retryError) {
                                    console.error(
                                        "Final restart attempt failed:",
                                        retryError
                                    );
                                    toast.warning(
                                        "Transcription will continue when speech is detected"
                                    );
                                }
                            }, 2000);
                        }
                    }, 500);
                }
            };

            setRecognition(recognitionInstance);
            setTranscriptionStatus("Ready");
        } else {
            console.warn("Speech recognition not supported in this browser");
            setIsTranscribing(false);
            setTranscriptionStatus("Not supported");
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

            // Mark participant as joined
            updateParticipantStatus("JOINED");

            // Auto-start transcription after a short delay
            setTimeout(() => {
                console.log("Auto-starting transcription...", {
                    transcriptionStarted: transcriptionStarted,
                    recognition: !!recognition,
                    isTranscribing: isTranscribing,
                });

                // Use a more reliable check - if recognition exists and we haven't started yet
                if (recognition && !transcriptionStarted) {
                    console.log("Starting transcription automatically...");
                    startTranscription();
                } else {
                    console.log("Transcription not auto-started because:", {
                        hasRecognition: !!recognition,
                        transcriptionStarted: transcriptionStarted,
                        isTranscribing: isTranscribing,
                    });
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
                // User initiated disconnect - handle navigation properly
                console.log("User initiated disconnect");
                if (onMeetingEnd) {
                    onMeetingEnd();
                } else {
                    window.location.href = `/meeting/${meetingId}`;
                }
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
                } else {
                    window.location.href = `/meeting/${meetingId}`;
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
            setParticipants((prev) => {
                const newParticipants = prev.filter(
                    (p) => p.sid !== participant.sid
                );

                // Check if this was the last participant (not including ourselves)
                // We check room.remoteParticipants.size for accurate count
                setTimeout(async () => {
                    if (room && room.remoteParticipants.size === 0) {
                        console.log(
                            "Last participant left, checking if meeting should be completed"
                        );
                        await checkAndCompleteIfEmpty();
                    }
                }, 1000); // Small delay to ensure LiveKit has updated participant counts

                return newParticipants;
            });
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
                        console.log(
                            "Already connected, skipping connection attempt"
                        );
                        return;
                    }

                    await room.connect(serverUrl, token);
                } catch (error) {
                    if (!isMounted) return;

                    console.error("Failed to connect to room:", error);

                    // Only retry for specific errors and limit retries
                    if (
                        retryCount < 2 &&
                        (error.message.includes("network") ||
                            error.message.includes("timeout") ||
                            error.message.includes("connection") ||
                            error.message.includes("WebSocket"))
                    ) {
                        console.log(
                            `Retrying connection (attempt ${
                                retryCount + 2
                            }/3)...`
                        );
                        toast.info(
                            `Retrying connection (${retryCount + 2}/3)...`
                        );
                        setTimeout(
                            () => connectWithRetry(retryCount + 1),
                            1500
                        );
                    } else {
                        console.error(
                            "Connection failed permanently:",
                            error.message
                        );
                        toast.error(
                            `Failed to connect to meeting: ${error.message}`
                        );
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
                    if (
                        room.state === "connected" ||
                        room.state === "connecting"
                    ) {
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
        console.log("startTranscription called", {
            recognition: !!recognition,
            transcriptionStarted,
        });

        // Check microphone permissions first
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            console.log("Microphone access granted");
            stream.getTracks().forEach((track) => track.stop()); // Clean up the test stream
        } catch (error) {
            console.error("Microphone access denied:", error);
            toast.error(
                "Microphone access denied. Please allow microphone access for transcription."
            );
            return;
        }

        if (!recognition) {
            console.error("No recognition instance available");
            toast.error("Speech recognition not available");
            return;
        }

        try {
            setTranscriptionStarted(true);
            setIsTranscribing(true);
            recognition.start();
            console.log("Speech recognition start() called");
            toast.success("Transcription started!");
        } catch (error) {
            console.error("Error starting speech recognition:", error);
            setTranscriptionStarted(false);
            setIsTranscribing(false);
            if (error.name === "InvalidStateError") {
                console.log("Recognition already running, continuing...");
                toast.info("Transcription already active");
            } else {
                toast.error(`Failed to start transcription: ${error.message}`);
            }
        }
    }; // Stop transcription
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

    // Restart transcription manually
    const restartTranscription = async () => {
        console.log("Manual transcription restart requested");
        toast.info("Restarting transcription...");

        try {
            // Stop current recognition if running
            if (recognition && transcriptionStarted) {
                recognition.stop();
                setTranscriptionStarted(false);
                setIsTranscribing(false);

                // Wait a moment before restarting
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            // Start fresh
            await startTranscription();
        } catch (error) {
            console.error("Failed to restart transcription:", error);
            toast.error("Failed to restart transcription. Please try again.");
        }
    };

    const saveTranscriptSegment = async (text) => {
        if (!text.trim()) return;

        console.log("Saving transcript segment:", text);
        try {
            const response = await fetch(
                `/api/meetings/${meetingId}/transcript/autosave`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        content: text,
                        timestamp: new Date().toISOString(),
                        speaker: "participant",
                    }),
                }
            );

            if (response.ok) {
                console.log("Transcript segment saved successfully");
            } else {
                console.error(
                    "Failed to save transcript segment:",
                    response.status,
                    response.statusText
                );
            }
        } catch (error) {
            console.error("Failed to save transcript:", error);
        }
    };

    const leaveMeeting = async () => {
        try {
            await updateParticipantStatus("LEFT");

            if (room) {
                await room.disconnect();
            }

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
                                            title={transcriptionStatus}
                                        >
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            {transcriptionStatus}
                                        </Badge>
                                    )}
                                    {!isTranscribing && recognition && (
                                        <Badge
                                            variant="outline"
                                            className="flex items-center gap-1.5 bg-red-500/20 border-red-500 text-red-400 text-sm px-3 py-1"
                                            title="Transcription stopped"
                                        >
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            Transcription Off
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isTranscribing && recognition && (
                                    <Button
                                        onClick={restartTranscription}
                                        variant="outline"
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 text-sm px-3 py-2"
                                    >
                                        🎤 Restart Transcription
                                    </Button>
                                )}
                                {isTranscribing && (
                                    <Button
                                        onClick={stopTranscription}
                                        variant="outline"
                                        size="sm"
                                        className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 text-sm px-3 py-2"
                                    >
                                        Stop Transcription
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
