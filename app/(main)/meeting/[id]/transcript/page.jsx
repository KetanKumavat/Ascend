import { notFound } from "next/navigation";
import { TranscriptDisplay } from "@/components/transcript-display";
import { getMeeting } from "@/actions/meetings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Video } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
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

        const now = new Date();
        const scheduledDate = new Date(meeting.scheduledAt);
        const endTime = new Date(
            scheduledDate.getTime() + (meeting.duration || 60) * 60 * 1000
        );

        const isLive =
            meeting.status === "SCHEDULED" &&
            scheduledDate <= now &&
            endTime > now;
        const isPast = meeting.status === "COMPLETED" || endTime <= now;

        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 pointer-events-none" />

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(163_163_163/0.15)_1px,transparent_0)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(115_115_115/0.15)_1px,transparent_0)] pointer-events-none" />

                <PageHeader
                    title={`${meeting.title} - Transcript`}
                    subtitle="AI-powered meeting transcription and analysis"
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
                        { label: "Transcript", icon: "FileText" },
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
                        <Badge variant="outline">LiveKit + AI</Badge>
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
                                <Link href={`/meeting/${meeting.id}/room`}>
                                    <Button
                                        size="lg"
                                        className="flex items-center gap-2"
                                        variant={isLive ? "default" : "outline"}
                                        disabled={isPast}
                                    >
                                        <Video className="w-4 h-4" />
                                        {isLive
                                            ? "Join Live Meeting"
                                            : "Meeting Room"}
                                        {isLive && (
                                            <Badge className="bg-green-500 text-white text-xs ml-2">
                                                Live
                                            </Badge>
                                        )}
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transcript Display Component */}
                    <TranscriptDisplay meetingId={meeting.id} />

                    {/* Instructions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                🎥 LiveKit Video Meetings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold mb-2">
                                        � Video Conference Features:
                                    </h4>
                                    <ol className="text-sm space-y-1 list-decimal list-inside">
                                        <li>
                                            HD video and crystal clear audio
                                        </li>
                                        <li>
                                            Screen sharing and presentation mode
                                        </li>
                                        <li>Real-time chat messaging</li>
                                        <li>Participant management tools</li>
                                    </ol>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">
                                        🤖 AI Transcription Features:
                                    </h4>
                                    <ul className="text-sm space-y-1 list-disc list-inside">
                                        <li>Real-time speech-to-text</li>
                                        <li>Speaker identification</li>
                                        <li>AI-generated meeting summary</li>
                                        <li>Action items extraction</li>
                                        <li>Key highlights identification</li>
                                        <li>Searchable transcript archive</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                <p className="text-sm text-blue-700">
                                    🚀 <strong>Powered by LiveKit:</strong>{" "}
                                    Enterprise-grade video infrastructure with
                                    built-in AI transcription agents. Start your
                                    meeting and transcription will begin
                                    automatically!
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
