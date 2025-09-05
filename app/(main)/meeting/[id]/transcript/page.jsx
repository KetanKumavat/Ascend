import { notFound } from "next/navigation";
import { LiveTranscript } from "@/components/live-transcript";
import { getMeeting } from "@/actions/meetings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Video } from "lucide-react";
import { JoinMeetingButton } from "@/components/join-meeting-button";
import PageHeader from "@/components/ui/page-header";

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
            <div className="min-h-screen pt-10 bg-neutral-50 dark:bg-neutral-900">
                <PageHeader
                    title={`${meeting.title} - Transcript`}
                    subtitle="Live transcription and meeting insights"
                    backHref={`/project/${meeting.projectId}/meetings`}
                    breadcrumb={[
                        {
                            label: "Organization",
                            href: `/organization/${meeting.project.organizationId}`,
                            icon: "Home",
                        },
                        {
                            label: "Project",
                            href: `/project/${meeting.projectId}`,
                            icon: "FolderIcon",
                        },
                        {
                            label: "Meetings",
                            href: `/project/${meeting.projectId}/meetings`,
                        },
                        { label: "Transcript", icon: "FileTextIcon" },
                    ]}
                >
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
                </PageHeader>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Video className="w-6 h-6" />
                                {meeting.title}
                            </CardTitle>
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
                                            Enter your name in the transcript
                                            field
                                        </li>
                                        <li>
                                            Click &quot;Start Recording&quot; to
                                            begin transcription
                                        </li>
                                        <li>
                                            Speak clearly near your microphone
                                        </li>
                                        <li>
                                            Save transcript to database when
                                            done
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
                                        <li>
                                            Download transcript as text file
                                        </li>
                                        <li>AI-powered meeting insights</li>
                                        <li>Action items extraction</li>
                                        <li>Key points summary</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                                <p className="text-sm text-green-700">
                                    💡 <strong>Pro Tip:</strong> Use Chrome or
                                    Edge for best transcription accuracy. Each
                                    participant can run their own transcription
                                    and we&apos;ll merge them automatically!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    } catch (error) {
        console.error("Error loading meeting:", error);
        notFound();
    }
}
