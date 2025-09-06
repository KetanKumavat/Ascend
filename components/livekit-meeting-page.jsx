"use client";

import { useState, useEffect } from "react";
import { LiveKitMeetingRoom } from "@/components/livekit-meeting-room";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Auto-join the meeting for authenticated users
    useEffect(() => {
        joinMeeting();
    }, [meetingId]);

    // Get meeting access token and auto-join
    const joinMeeting = async () => {
        if (token) return; // Prevent duplicate calls

        setIsLoading(true);
        try {
            const response = await fetch(`/api/meetings/${meetingId}/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to get meeting access");
            }

            const data = await response.json();
            setToken(data.token);
            setServerUrl(data.serverUrl);
            toast.success("Connecting to meeting...");
        } catch (error) {
            console.error("Failed to join meeting:", error);
            setError(error.message);
            toast.error("Failed to join meeting. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMeetingEnd = () => {
        setToken(null);
        setServerUrl(null);
        toast.info("Meeting ended");
        // Redirect back to meeting details
        window.location.href = `/meeting/${meetingId}`;
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <Card className="w-full max-w-md bg-black/50 border-gray-600">
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 mx-auto text-white" />
                            <h3 className="text-lg font-semibold mb-2 text-white">
                                Connecting to Meeting...
                            </h3>
                            <p className="text-gray-300">
                                Setting up {meetingTitle}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <Card className="w-full max-w-md bg-black/50 border-gray-600">
                    <CardContent className="py-12">
                        <div className="text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mb-4 mx-auto" />
                            <h3 className="text-lg font-semibold mb-2 text-white">
                                Cannot Join Meeting
                            </h3>
                            <p className="text-gray-300 mb-4">{error}</p>
                            <Button
                                onClick={() => window.location.href = `/meeting/${meetingId}`}
                                variant="outline"
                            >
                                Back to Meeting Details
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (token && serverUrl) {
        return (
            <LiveKitMeetingRoom
                meetingId={meetingId}
                meetingTitle={meetingTitle}
                token={token}
                serverUrl={serverUrl}
                onMeetingEnd={handleMeetingEnd}
            />
        );
    }

    return null;
}
