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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [startTime, setStartTime] = useState(null);

    // Helper function to get human-readable disconnect reason
    const getDisconnectReasonText = (reason) => {
        switch (reason) {
            case DisconnectReason.CLIENT_INITIATED:
                return "You left the meeting";
            case DisconnectReason.DUPLICATE_IDENTITY:
                return "Another user joined with the same identity";
            case DisconnectReason.SERVER_SHUTDOWN:
                return "Server maintenance";
            case DisconnectReason.PARTICIPANT_REMOVED:
                return "You were removed from the meeting";
            case DisconnectReason.ROOM_DELETED:
                return "Meeting was ended";
            case DisconnectReason.STATE_MISMATCH:
                return "Connection state error";
            case DisconnectReason.JOIN_FAILURE:
                return "Failed to join meeting";
            default:
                return "Connection lost";
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
            connectionTimeout: 30000,
            // enable regional url fallback
            regionUrlProvider: {
                fallbackUrls: [
                    "wss://ascend-live-meet-7t8xf5bg.mumbai.livekit.cloud",
                    "wss://ascend-live-meet-7t8xf5bg.singapore.livekit.cloud",
                ],
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

            // Only show toast and call onMeetingEnd if it wasn't a cleanup disconnect
            if (reason !== DisconnectReason.CLIENT_INITIATED) {
                const reasonText = getDisconnectReasonText(reason);
                toast.info(`Disconnected from meeting: ${reasonText}`);

                // Only call onMeetingEnd for unexpected disconnections
                if (
                    reason === DisconnectReason.UNKNOWN_REASON ||
                    reason === DisconnectReason.SERVER_SHUTDOWN
                ) {
                    if (onMeetingEnd) {
                        onMeetingEnd();
                    }
                }
            }

            // Update meeting status to COMPLETED only if not cleanup
            if (reason !== DisconnectReason.CLIENT_INITIATED) {
                updateMeetingStatus("COMPLETED");
            }
        });

        room.on(RoomEvent.ParticipantConnected, (participant) => {
            if (!isMounted) return;
            console.log("Participant connected:", participant.name);
            setParticipants((prev) => [...prev, participant]);
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

        // Connect to room with detailed error logging and retry
        console.log("Attempting to connect to LiveKit:", {
            serverUrl,
            tokenLength: token?.length,
            meetingId,
        });

        // Prevent double connection in React Strict Mode
        if (!isConnecting) {
            isConnecting = true;
            setConnectionState(ConnectionState.Connecting);

            const connectWithRetry = async (retryCount = 0) => {
                try {
                    await room.connect(serverUrl, token);
                } catch (error) {
                    if (!isMounted) return;

                    console.error("Failed to connect to room:", error);
                    console.error("Connection details:", {
                        serverUrl,
                        meetingId,
                        retryCount,
                    });

                    // Retry connection up to 3 times for network errors
                    if (
                        retryCount < 3 &&
                        (error.message.includes("network") ||
                            error.message.includes("timeout") ||
                            error.message.includes("connection"))
                    ) {
                        console.log(
                            `Retrying connection (attempt ${
                                retryCount + 1
                            }/3)...`
                        );
                        toast.info(
                            `Retrying connection (${retryCount + 1}/3)...`
                        );
                        setTimeout(
                            () => connectWithRetry(retryCount + 1),
                            2000
                        );
                    } else {
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
            if (room && room.state !== "disconnected") {
                room.disconnect();
            }
        };
    }, [
        token,
        serverUrl,
        meetingId,
        onMeetingEnd,
        onTranscriptUpdate,
        updateMeetingStatus,
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

    // Start transcription with LiveKit agent
    const startTranscription = async () => {
        if (!room || isTranscribing) return;

        try {
            setIsTranscribing(true);

            // Send command to start transcription agent
            const data = {
                type: "start_transcription",
                meetingId,
                language: "en-US",
            };

            await room.localParticipant.publishData(
                new TextEncoder().encode(JSON.stringify(data)),
                true // reliable
            );

            toast.success("Transcription started");
        } catch (error) {
            console.error("Failed to start transcription:", error);
            toast.error("Failed to start transcription");
            setIsTranscribing(false);
        }
    };

    // Stop transcription
    const stopTranscription = async () => {
        if (!room || !isTranscribing) return;

        try {
            // Send command to stop transcription agent
            const data = {
                type: "stop_transcription",
                meetingId,
            };

            await room.localParticipant.publishData(
                new TextEncoder().encode(JSON.stringify(data)),
                true
            );

            setIsTranscribing(false);
            toast.success("Transcription stopped");
        } catch (error) {
            console.error("Failed to stop transcription:", error);
            toast.error("Failed to stop transcription");
        }
    };

    // Format duration
    const formatDuration = (start) => {
        if (!start) return "00:00";
        const duration = new Date() - start;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
    };

    // Leave meeting
    const leaveMeeting = () => {
        if (room) {
            room.disconnect();
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
        <div className="space-y-4">
            {/* Meeting Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            {meetingTitle}
                        </CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>
                                    {participants.length + 1} participant
                                    {participants.length !== 0 ? "s" : ""}
                                </span>
                            </div>
                            {startTime && (
                                <Badge
                                    variant="outline"
                                    className="flex items-center gap-1"
                                >
                                    <Clock className="w-3 h-3" />
                                    {formatDuration(startTime)}
                                </Badge>
                            )}
                            {isTranscribing && (
                                <Badge
                                    variant="secondary"
                                    className="flex items-center gap-1"
                                >
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    Transcribing
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        {!isTranscribing ? (
                            <Button
                                onClick={startTranscription}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                            >
                                Start Transcription
                            </Button>
                        ) : (
                            <Button
                                onClick={stopTranscription}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                            >
                                Stop Transcription
                            </Button>
                        )}
                        <Button
                            onClick={leaveMeeting}
                            variant="destructive"
                            size="sm"
                        >
                            Leave Meeting
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* LiveKit Video Conference */}
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <LiveKitRoom
                        video={true}
                        audio={true}
                        token={token}
                        serverUrl={serverUrl}
                        data-lk-theme="default"
                        style={{ height: "70vh" }}
                        room={room}
                    >
                        <VideoConference />
                        <RoomAudioRenderer />
                    </LiveKitRoom>
                </CardContent>
            </Card>
        </div>
    );
}
