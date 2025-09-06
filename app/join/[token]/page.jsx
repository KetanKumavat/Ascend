"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LiveKitMeetingRoom } from "@/components/livekit-meeting-room";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Video, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function PublicMeetingJoin() {
    const params = useParams();
    const router = useRouter();
    const { token } = params;

    const [meeting, setMeeting] = useState(null);
    const [participantName, setParticipantName] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);
    const [livekitToken, setLivekitToken] = useState(null);
    const [serverUrl, setServerUrl] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMeetingInfo();
    }, [token]);

    const fetchMeetingInfo = async () => {
        try {
            const response = await fetch(`/api/meetings/public/${token}`);
            if (!response.ok) {
                throw new Error("Meeting not found or invalid link");
            }
            const data = await response.json();
            setMeeting(data);
        } catch (error) {
            console.error("Error fetching meeting:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const joinMeeting = async () => {
        if (!participantName.trim()) {
            toast.error("Please enter your name");
            return;
        }

        setIsJoining(true);
        try {
            const response = await fetch(`/api/meetings/public/${token}/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    participantName: participantName.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to join meeting");
            }

            const data = await response.json();
            setLivekitToken(data.token);
            setServerUrl(data.serverUrl);
            setHasJoined(true);
            toast.success("Joined meeting successfully!");
        } catch (error) {
            console.error("Error joining meeting:", error);
            toast.error(error.message);
        } finally {
            setIsJoining(false);
        }
    };

    const handleMeetingEnd = () => {
        setHasJoined(false);
        setLivekitToken(null);
        toast.info("Meeting ended");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-800">
                <Card className="w-full max-w-md">
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 mx-auto" />
                            <p className="text-muted-foreground">
                                Loading meeting...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-800">
                <Card className="w-full max-w-md">
                    <CardContent className="py-12">
                        <div className="text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mb-4 mx-auto" />
                            <h3 className="text-lg font-semibold mb-2">
                                Meeting Not Found
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {error}
                            </p>
                            <Button
                                onClick={() => router.push("/")}
                                variant="outline"
                            >
                                Go Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (hasJoined && livekitToken && serverUrl) {
        return (
            <LiveKitMeetingRoom
                meetingId={meeting.id}
                meetingTitle={meeting.title}
                token={livekitToken}
                serverUrl={serverUrl}
                onMeetingEnd={handleMeetingEnd}
            />
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-800">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Video className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">{meeting.title}</CardTitle>
                    <p className="text-muted-foreground">
                        You&apos;re invited to join this meeting
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>
                                {meeting.participants?.length || 0}{" "}
                                participant(s)
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-muted-foreground" />
                            <span>
                                {meeting.status === "IN_PROGRESS"
                                    ? "Live now"
                                    : "Scheduled"}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Your Name
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter your name"
                                value={participantName}
                                onChange={(e) =>
                                    setParticipantName(e.target.value)
                                }
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        joinMeeting();
                                    }
                                }}
                                disabled={isJoining}
                            />
                        </div>

                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                By joining this meeting, you agree to be
                                recorded for transcription purposes.
                            </AlertDescription>
                        </Alert>

                        <Button
                            onClick={joinMeeting}
                            disabled={isJoining || !participantName.trim()}
                            className="w-full"
                            size="lg"
                        >
                            {isJoining ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Joining Meeting...
                                </>
                            ) : (
                                <>
                                    <Video className="w-4 h-4 mr-2" />
                                    Join Meeting
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
