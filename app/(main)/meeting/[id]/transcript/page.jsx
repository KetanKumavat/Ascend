import { notFound } from "next/navigation";
import { LiveTranscript } from "@/components/live-transcript";
import { getMeeting } from "@/actions/meetings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Video, ArrowLeft, Home, FolderIcon } from "lucide-react";
import { JoinMeetingButton } from "@/components/join-meeting-button";
import Link from "next/link";

export default async function MeetingTranscriptPage({ params }) {
    try {
        const pid = await params.id;
        if (!pid) {
            notFound();
        }
        const meeting = await getMeeting(pid);

        if (!meeting) {
            notFound();
        }

        const isLive =
            meeting.status === "SCHEDULED" &&
            new Date(meeting.scheduledAt) <= new Date();
        const isPast =
            meeting.status === "COMPLETED" ||
            new Date(meeting.scheduledAt) <
                new Date(Date.now() - meeting.duration * 60 * 1000);

        return (
            <div className="container mx-auto p-6 space-y-6 pt-6">
                {/* Navigation Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link
                        href={`/organization/${meeting.project.organizationId}`}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Organization
                    </Link>
                    <span>/</span>
                    <Link
                        href={`/project/${meeting.projectId}`}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                        <FolderIcon className="w-4 h-4" />
                        Project
                    </Link>
                    <span>/</span>
                    <Link
                        href={`/project/${meeting.projectId}/meetings`}
                        className="hover:text-foreground transition-colors"
                    >
                        Meetings
                    </Link>
                    <span>/</span>
                    <span className="text-foreground">Transcript</span>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Back Button */}
                                <Link
                                    href={`/project/${meeting.projectId}/meetings`}
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Meetings
                                    </Button>
                                </Link>

                                <CardTitle className="flex items-center gap-2">
                                    <Video className="w-6 h-6" />
                                    {meeting.title}
                                </CardTitle>
                            </div>
                            <div className="flex gap-2">
                                <Badge
                                    variant={
                                        isLive
                                            ? "destructive"
                                            : isPast
                                            ? "secondary"
                                            : "outline"
                                    }
                                >
                                    {isLive
                                        ? "🔴 Live"
                                        : isPast
                                        ? "Ended"
                                        : "Scheduled"}
                                </Badge>
                                <Badge variant="outline">FREE Video Call</Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {new Date(
                                        meeting.scheduledAt
                                    ).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {meeting.participants?.length || 0}{" "}
                                    participants
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Video className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {meeting.duration} minutes
                                </span>
                            </div>
                        </div>

                        {meeting.description && (
                            <p className="text-muted-foreground mb-4">
                                {meeting.description}
                            </p>
                        )}

                        <div className="flex gap-2">
                            <JoinMeetingButton
                                meetingUrl={meeting.meetingUrl}
                                className="flex-1"
                            />

                            {meeting.meetingUrl && (
                                <div className="flex-1">
                                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                                        <strong>Meeting Link:</strong>
                                        <br />
                                        <code className="text-xs">
                                            {meeting.meetingUrl}
                                        </code>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Live Transcript Component */}
                <LiveTranscript
                    meetingId={meeting.id}
                    meetingTitle={meeting.title}
                />

                {/* Instructions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            📝 How to Use Live Transcription
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2">
                                    🎤 For Meeting Participants:
                                </h4>
                                <ol className="text-sm space-y-1 list-decimal list-inside">
                                    <li>
                                        Enter your name in the transcript field
                                    </li>
                                    <li>
                                        Click &quot;Start Recording&quot; to
                                        begin transcription
                                    </li>
                                    <li>Speak clearly near your microphone</li>
                                    <li>
                                        Save transcript to database when done
                                    </li>
                                </ol>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">
                                    🚀 Features Available (FREE):
                                </h4>
                                <ul className="text-sm space-y-1 list-disc list-inside">
                                    <li>Real-time speech-to-text</li>
                                    <li>Multiple speaker identification</li>
                                    <li>Download transcript as text file</li>
                                    <li>AI-powered meeting insights</li>
                                    <li>Action items extraction</li>
                                    <li>Key points summary</li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm text-green-700">
                                💡 <strong>Pro Tip:</strong> Use Chrome or Edge
                                for best transcription accuracy. Each
                                participant can run their own transcription and
                                we&apos;ll merge them automatically!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    } catch (error) {
        console.error("Error loading meeting:", error);
        notFound();
    }
}
