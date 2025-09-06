"use client";

import { useState } from "react";
import { LiveKitMeetingRoom } from "@/components/livekit-meeting-room";
import { TranscriptDisplay } from "@/components/transcript-display";
import { MeetingShareCard } from "@/components/meeting-share-card";
import { QuickShareButton } from "@/components/quick-share-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Video,
    FileText,
    Share2,
    Users,
    Clock,
    Loader2,
    Play,
    Settings,
} from "lucide-react";
import { toast } from "sonner";

export function LiveKitMeetingPage({
    meetingId,
    meetingTitle,
    meetingDescription,
    scheduledAt,
    duration,
}) {
    const [token, setToken] = useState(null);
    const [serverUrl, setServerUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);
    const [activeTab, setActiveTab] = useState("meeting");
    const [participantName, setParticipantName] = useState("");
    const [meetingStatus, setMeetingStatus] = useState("SCHEDULED");

    // Get meeting access token
    const joinMeeting = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/meetings/${meetingId}/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    participantName: participantName || undefined,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get meeting access");
            }

            const data = await response.json();
            setToken(data.token);
            setServerUrl(data.serverUrl);
            setHasJoined(true);
            toast.success("Joining meeting...");
        } catch (error) {
            console.error("Failed to join meeting:", error);
            toast.error("Failed to join meeting. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle meeting end
    const handleMeetingEnd = () => {
        setHasJoined(false);
        setToken(null);
        setServerUrl(null);
        setMeetingStatus("COMPLETED");
        setActiveTab("transcript");
        toast.info("Meeting ended");
    };

    // Handle transcript updates
    const handleTranscriptUpdate = (transcriptData) => {
        // This function can be used to handle real-time transcript updates
        // For now, we'll just log the updates since the TranscriptDisplay component
        // handles its own real-time updates
        console.log("Transcript update received:", transcriptData);
    };

    // Check meeting status and time
    const isScheduledTime = new Date(scheduledAt) <= new Date();
    const isPastMeeting =
        new Date(scheduledAt) <
        new Date(Date.now() - (duration || 60) * 60 * 1000);

    if (!hasJoined) {
        return (
            <div className="space-y-6">
                {/* Meeting Info Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Video className="w-6 h-6" />
                                {meetingTitle}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <QuickShareButton
                                    meetingId={meetingId}
                                    variant="outline"
                                    size="sm"
                                />
                                <Badge
                                    variant={
                                        isPastMeeting
                                            ? "secondary"
                                            : isScheduledTime
                                            ? "destructive"
                                            : "outline"
                                    }
                                >
                                    {isPastMeeting
                                        ? "Ended"
                                        : isScheduledTime
                                        ? "🔴 Live"
                                        : "Scheduled"}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {meetingDescription && (
                            <p className="text-muted-foreground">
                                {meetingDescription}
                            </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {new Date(scheduledAt).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                    Duration: {duration || 60} minutes
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Video className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                    LiveKit Video Conference
                                </span>
                            </div>
                        </div>

                        {/* Participant name input and actions */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <input
                                    type="text"
                                    placeholder="Your display name (optional)"
                                    value={participantName}
                                    onChange={(e) =>
                                        setParticipantName(e.target.value)
                                    }
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                />
                                <Button
                                    onClick={joinMeeting}
                                    disabled={
                                        isLoading ||
                                        (!isScheduledTime && !isPastMeeting)
                                    }
                                    size="lg"
                                    className="flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Play className="w-4 h-4" />
                                    )}
                                    {isLoading ? "Joining..." : "Join Meeting"}
                                </Button>
                            </div>

                            {/* Quick sharing component */}
                            <MeetingShareCard
                                meetingId={meetingId}
                                meetingTitle={meetingTitle}
                            />
                        </div>

                        {!isScheduledTime && !isPastMeeting && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-yellow-600" />
                                    <p className="text-sm text-yellow-700">
                                        Meeting is scheduled for{" "}
                                        <strong>
                                            {new Date(
                                                scheduledAt
                                            ).toLocaleString()}
                                        </strong>
                                        . You can join when it starts.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Features Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Meeting Features
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2">
                                    Video Conference:
                                </h4>
                                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                                    <li>High-quality video and audio</li>
                                    <li>Screen sharing capability</li>
                                    <li>Chat messaging</li>
                                    <li>Participant management</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">
                                    AI Transcription:
                                </h4>
                                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                                    <li>Real-time speech-to-text</li>
                                    <li>Speaker identification</li>
                                    <li>AI-generated summary</li>
                                    <li>Action items extraction</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Show transcript if available */}
                <TranscriptDisplay meetingId={meetingId} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger
                        value="meeting"
                        className="flex items-center gap-2"
                    >
                        <Video className="w-4 h-4" />
                        Meeting Room
                    </TabsTrigger>
                    <TabsTrigger
                        value="transcript"
                        className="flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        Transcript
                    </TabsTrigger>
                    <TabsTrigger
                        value="share"
                        className="flex items-center gap-2"
                    >
                        <Share2 className="w-4 h-4" />
                        Share
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="meeting" className="space-y-4">
                    <LiveKitMeetingRoom
                        meetingId={meetingId}
                        meetingTitle={meetingTitle}
                        token={token}
                        serverUrl={serverUrl}
                        onMeetingEnd={handleMeetingEnd}
                        onTranscriptUpdate={handleTranscriptUpdate}
                    />
                </TabsContent>

                <TabsContent value="transcript" className="space-y-4">
                    <TranscriptDisplay meetingId={meetingId} />
                </TabsContent>

                <TabsContent value="share" className="space-y-4">
                    <MeetingShareCard
                        meetingId={meetingId}
                        meetingTitle={meetingTitle}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
