import { notFound } from "next/navigation";
import { getMeeting } from "@/actions/meetings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Video, FileText, Calendar, PenTool } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import Link from "next/link";
import { QuickShareButton } from "@/components/quick-share-button";

export default async function MeetingDetailsPage({ params }) {
    try {
        const resolvedParams = await params;
        const pid = resolvedParams.id;

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

        const getStatusBadge = () => {
            if (isPast) return <Badge variant="secondary">Past</Badge>;
            if (isLive)
                return <Badge className="bg-green-500 text-white">Live</Badge>;
            return <Badge variant="outline">Scheduled</Badge>;
        };

        const formatDateTime = (date) => {
            return new Date(date).toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        };

        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 pointer-events-none" />

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(163_163_163/0.15)_1px,transparent_0)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(115_115_115/0.15)_1px,transparent_0)] pointer-events-none" />
                <div className="relative">
                    <PageHeader
                        title={meeting.title}
                        subtitle="Meeting Details & Actions"
                        backHref={
                            meeting.projectId
                                ? `/project/${meeting.projectId}/meetings`
                                : `/organization/${meeting.organizationId}/meetings`
                        }
                        breadcrumb={[
                            {
                                label: "Organization",
                                href: `/organization/${meeting.organizationId}`,
                            },
                            ...(meeting.project
                                ? [
                                      {
                                          label: meeting.project.name,
                                          href: `/project/${meeting.projectId}`,
                                      },
                                      {
                                          label: "Meetings",
                                          href: `/project/${meeting.projectId}/meetings`,
                                      },
                                  ]
                                : [
                                      {
                                          label: "Meetings",
                                          href: `/organization/${meeting.organizationId}/meetings`,
                                      },
                                  ]),
                            {
                                label: meeting.title,
                            },
                        ]}
                    />
                </div>

                <div className="container mx-auto px-4 py-6 space-y-6 z-50 relative">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CardTitle className="text-2xl">
                                        {meeting.title}
                                    </CardTitle>
                                    {getStatusBadge()}
                                </div>
                                <QuickShareButton meetingId={meeting.id} />
                            </div>
                            {meeting.description && (
                                <p className="text-muted-foreground mt-2">
                                    {meeting.description}
                                </p>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            Scheduled
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDateTime(
                                                meeting.scheduledAt
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            Duration
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {meeting.duration || 60} minutes
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            Participants
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {meeting.participants?.length || 0}{" "}
                                            members
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Meeting Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Link href={`/meeting/${meeting.id}/room`}>
                                    <Button
                                        className="w-full h-20 flex-col gap-2"
                                        variant={isLive ? "default" : "outline"}
                                        disabled={isPast}
                                    >
                                        <Video className="h-6 w-6" />
                                        <span className="font-medium">
                                            Join Meeting Room
                                        </span>
                                        {isLive && (
                                            <Badge className="bg-green-500 text-white text-xs">
                                                Live Now
                                            </Badge>
                                        )}
                                    </Button>
                                </Link>

                                <Link
                                    href={`/meeting/${meeting.id}/transcript`}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full h-20 flex-col gap-2"
                                    >
                                        <FileText className="h-6 w-6" />
                                        <span className="font-medium">
                                            View Transcript
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            AI-generated meeting notes
                                        </span>
                                    </Button>
                                </Link>

                                <Link
                                    href={`/project/${meeting.projectId}/canvas`}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full h-20 flex-col gap-2"
                                        disabled={!meeting.projectId}
                                    >
                                        <PenTool className="h-6 w-6" />
                                        <span className="font-medium">
                                            Open Canvas
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Collaborative whiteboard
                                        </span>
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {meeting.project && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Project Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm">
                                            <span className="font-medium">
                                                Project:
                                            </span>{" "}
                                            <Link
                                                href={`/project/${meeting.projectId}`}
                                                className="text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                {meeting.project.name}
                                            </Link>
                                        </p>
                                        {meeting.project.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {meeting.project.description}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Meeting Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Platform:</span>
                                        <span className="font-medium">
                                            LiveKit
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>AI Transcription:</span>
                                        <span className="text-green-600 dark:text-green-400">
                                            Enabled
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Public Access:</span>
                                        <span
                                            className={
                                                meeting.isPublic
                                                    ? "text-green-600 dark:text-green-400"
                                                    : "text-muted-foreground"
                                            }
                                        >
                                            {meeting.isPublic
                                                ? "Enabled"
                                                : "Disabled"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Status:</span>
                                        <span className="capitalize">
                                            {meeting.status.toLowerCase()}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {meeting.participants &&
                        meeting.participants.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Participants (
                                        {meeting.participants.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {meeting.participants.map(
                                            (participant) => (
                                                <div
                                                    key={participant?.id}
                                                    className="flex items-center gap-3 p-3 border rounded-lg dark:border-gray-700"
                                                >
                                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                            {participant?.user?.name?.charAt(
                                                                0
                                                            ) || "U"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {
                                                                participant
                                                                    ?.user?.name
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground capitalize">
                                                            {participant?.role?.toLowerCase()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                </div>
            </div>
        );
    } catch (error) {
        console.error("Meeting page error:", error);
        notFound();
    }
}
