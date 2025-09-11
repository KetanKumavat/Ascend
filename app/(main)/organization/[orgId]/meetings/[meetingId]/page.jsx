import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getMeeting } from "@/actions/meetings";
import { TranscriptViewer } from "@/components/transcript-viewer";
import { JoinMeetingButton } from "@/components/join-meeting-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeftIcon,
    VideoIcon,
    CalendarIcon,
    ClockIcon,
    UsersIcon,
    PlayIcon,
} from "lucide-react";
import format from "date-fns/format";
import Link from "next/link";
import Image from "next/image";

export default async function MeetingDetailPage({ params }) {
    const { orgId, meetingId } = await params;
    const auth_result = await auth();
    const { userId } = auth_result;

    if (!userId) {
        redirect("/sign-in");
    }

    let meeting;
    try {
        meeting = await getMeeting(meetingId);
    } catch (error) {
        return (
            <div className="mx-auto w-full max-w-4xl px-4 py-16">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <h2 className="text-xl font-semibold mb-2">
                            Meeting not found
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            The meeting you&apos;re looking for doesn&apos;t
                            exist or you don&apos;t have access to it.
                        </p>
                        <Link href={`/organization/${orgId}/meetings`}>
                            <Button>
                                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                Back to Meetings
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const getMeetingStatus = (meeting) => {
        const now = new Date();
        const scheduledTime = new Date(meeting.scheduledAt);
        const endTime = new Date(
            scheduledTime.getTime() + (meeting.duration || 60) * 60000
        );

        if (meeting.status === "CANCELLED") return "cancelled";
        if (meeting.status === "COMPLETED") return "completed";
        if (now >= scheduledTime && now <= endTime) return "in-progress";
        if (now > endTime) return "ended";
        return "upcoming";
    };

    const getStatusBadge = (meeting) => {
        const status = getMeetingStatus(meeting);

        const statusConfig = {
            upcoming: { variant: "secondary", label: "Upcoming" },
            "in-progress": {
                variant: "default",
                label: "Live",
                className: "bg-green-600 hover:bg-green-700",
            },
            ended: { variant: "outline", label: "Ended" },
            completed: { variant: "outline", label: "Completed" },
            cancelled: { variant: "destructive", label: "Cancelled" },
        };

        const config = statusConfig[status];
        return (
            <Badge variant={config.variant} className={config.className}>
                {config.label}
            </Badge>
        );
    };

    const canJoin =
        getMeetingStatus(meeting) === "upcoming" ||
        getMeetingStatus(meeting) === "in-progress";
    const showTranscript =
        getMeetingStatus(meeting) === "ended" ||
        getMeetingStatus(meeting) === "completed";

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link href={`/organization/${orgId}/meetings`}>
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Meetings
                    </Button>
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <VideoIcon className="w-6 h-6 text-blue-600" />
                            <h1 className="text-3xl font-bold">
                                {meeting.title}
                            </h1>
                            {getStatusBadge(meeting)}
                        </div>
                        {meeting.description && (
                            <p className="text-muted-foreground mb-4 max-w-2xl">
                                {meeting.description}
                            </p>
                        )}
                    </div>

                    {canJoin && meeting.meetingUrl && (
                        <JoinMeetingButton
                            meetingUrl={meeting.meetingUrl}
                            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                            size="lg"
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Meeting Details */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Meeting Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">
                                        {format(
                                            new Date(meeting.scheduledAt),
                                            "EEEE, MMMM do, yyyy"
                                        )}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(
                                            new Date(meeting.scheduledAt),
                                            "h:mm a"
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <ClockIcon className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">
                                        {meeting.duration || 60} minutes
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Duration
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <UsersIcon className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">
                                        {meeting.participants?.length || 0}{" "}
                                        participants
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Expected attendees
                                    </p>
                                </div>
                            </div>

                            {meeting.project && (
                                <div className="pt-2 border-t">
                                    <p className="text-sm text-muted-foreground mb-1">
                                        Project
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                            {meeting.project.key}
                                        </span>
                                        <span className="font-medium">
                                            {meeting.project.name}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 border-t">
                                <p className="text-sm text-muted-foreground mb-1">
                                    Created by
                                </p>
                                <div className="flex items-center gap-2">
                                    {meeting.createdBy.imageUrl && (
                                        <Image
                                            src={meeting.createdBy.imageUrl}
                                            alt={meeting.createdBy.name}
                                            className="w-6 h-6 rounded-full"
                                            width={24}
                                            height={24}
                                        />
                                    )}
                                    <span className="font-medium">
                                        {meeting.createdBy.name ||
                                            meeting.createdBy.email}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Participants */}
                    {meeting.participants &&
                        meeting.participants.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Participants</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {meeting.participants.map(
                                            (participant) => (
                                                <div
                                                    key={participant.id}
                                                    className="flex items-center gap-3"
                                                >
                                                    {participant.user
                                                        .imageUrl && (
                                                        <Image
                                                            src={
                                                                participant.user
                                                                    .imageUrl
                                                            }
                                                            alt={
                                                                participant.user
                                                                    .name
                                                            }
                                                            className="w-8 h-8 rounded-full"
                                                            width={32}
                                                            height={32}
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-medium">
                                                            {participant.user
                                                                .name ||
                                                                participant.user
                                                                    .email}
                                                        </p>
                                                        {participant.joinedAt && (
                                                            <p className="text-xs text-muted-foreground">
                                                                Joined{" "}
                                                                {format(
                                                                    new Date(
                                                                        participant.joinedAt
                                                                    ),
                                                                    "MMM d, h:mm a"
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                </div>

                {/* Transcript Section */}
                <div className="lg:col-span-2">
                    {showTranscript ? (
                        <TranscriptViewer
                            meetingId={meeting.id}
                            meeting={meeting}
                        />
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <VideoIcon className="w-16 h-16 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold mb-2">
                                    {getMeetingStatus(meeting) === "upcoming"
                                        ? "Meeting hasn't started yet"
                                        : "Meeting in progress"}
                                </h3>
                                <p className="text-muted-foreground text-center max-w-md">
                                    {getMeetingStatus(meeting) === "upcoming"
                                        ? "The transcript and AI-generated highlights will be available after the meeting ends."
                                        : "The transcript will be generated automatically when the meeting concludes."}
                                </p>
                                {canJoin && meeting.meetingUrl && (
                                    <Button
                                        className="mt-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                                        onClick={() =>
                                            window.open(
                                                meeting.meetingUrl,
                                                "_blank"
                                            )
                                        }
                                    >
                                        <PlayIcon className="w-4 h-4 mr-2" />
                                        Join Meeting
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
