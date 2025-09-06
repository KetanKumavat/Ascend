"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLinkIcon, AlertCircle } from "lucide-react";

// External meeting display - redirects to LiveKit room
export function GoogleMeetCodeDisplay({ meetingId, className = "" }) {
    return (
        <Card className={`w-full ${className}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ExternalLinkIcon className="w-5 h-5" />
                    External Meeting Notice
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <div>
                        <p className="text-sm font-medium text-blue-800">
                            External meetings don&apos;t provide transcription
                        </p>
                        <p className="text-xs text-blue-700">
                            For AI transcription, recording, and insights, use
                            our LiveKit meeting room.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={() =>
                            (window.location.href = `/meeting/${meetingId}/room`)
                        }
                        className="flex-1"
                    >
                        <ExternalLinkIcon className="w-4 h-4 mr-2" />
                        Use LiveKit Meeting Instead
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
