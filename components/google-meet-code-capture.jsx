"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLinkIcon, AlertCircle } from "lucide-react";

// External meeting component - no transcription provided
export function GoogleMeetCodeCapture({ meetingId }) {
    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ExternalLinkIcon className="w-5 h-5" />
                    External Meeting
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <div>
                        <p className="text-sm font-medium text-amber-800">
                            No Transcription Available
                        </p>
                        <p className="text-xs text-amber-700">
                            This is an external meeting. For AI transcription and meeting insights, use our LiveKit meeting room.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button 
                        onClick={() => window.location.href = `/meeting/${meetingId}/room`}
                        className="flex-1"
                    >
                        <ExternalLinkIcon className="w-4 h-4 mr-2" />
                        Switch to LiveKit Meeting
                    </Button>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                    For the best meeting experience with AI transcription, recording, and insights, 
                    use our built-in LiveKit meeting room instead.
                </div>
            </CardContent>
        </Card>
    );
}
