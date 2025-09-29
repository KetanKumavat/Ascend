"use client";

import { useState, useEffect, useMemo } from "react";
import { isToday, isTomorrow } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import {
    VideoIcon,
    CalendarIcon,
    ClockIcon,
    UsersIcon,
    PlayIcon,
    EyeIcon,
    MoreVerticalIcon,
    FileTextIcon,
    ExternalLinkIcon,
    Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CreateMeetingDialog } from "@/components/create-meeting";
import { JoinExternalMeetDialog } from "@/components/join-external-meeting-dialog";
import { toast } from "sonner";
import Link from "next/link";

const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

const formatInUserTimezone = (utcDate, formatString) => {
    const userTz = getUserTimezone();
    return formatInTimeZone(utcDate, userTz, formatString);
};

// Helper to check if a UTC date is today/tomorrow in user's timezone
const isDateInUserTimezone = (utcDate, checkFunction) => {
    const userTz = getUserTimezone();
    // Create a date object in user's timezone for comparison
    const userDate = new Date(
        formatInTimeZone(utcDate, userTz, "yyyy-MM-dd'T'HH:mm:ss")
    );
    return checkFunction(userDate);
};

export function MeetingsDashboard({ projects = [] }) {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProjectId, setSelectedProjectId] = useState("all");

    useEffect(() => {
        if (projects.length === 1 && selectedProjectId === "all") {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);

    useEffect(() => {
        let isMounted = true;

        const fetchMeetings = async () => {
            try {
                const url =
                    selectedProjectId && selectedProjectId !== "all"
                        ? `/api/meetings?projectId=${selectedProjectId}`
                        : "/api/meetings";

                const response = await fetch(url, {
                    headers: {
                        "Cache-Control": "max-age=60", // Cache for 1 minute
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch meetings");

                const data = await response.json();

                if (isMounted) {
                    const meetingsArray = data?.meetings
                        ? data.meetings
                        : Array.isArray(data)
                        ? data
                        : [];
                    setMeetings(meetingsArray);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching meetings:", error);
                if (isMounted) {
                    toast.error("Failed to load meetings");
                    setLoading(false);
                }
            }
        };

        fetchMeetings();

        return () => {
            isMounted = false;
        };
    }, [selectedProjectId]);

    // Function to refresh meetings after creation
    const refreshMeetings = async () => {
        try {
            const url =
                selectedProjectId && selectedProjectId !== "all"
                    ? `/api/meetings?projectId=${selectedProjectId}`
                    : "/api/meetings";

            const response = await fetch(url, {
                headers: {
                    "Cache-Control": "no-cache", // Force fresh data
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to fetch meetings");
            }

            const data = await response.json();
            // Extract meetings array from response object
            const meetingsArray = data?.meetings
                ? data.meetings
                : Array.isArray(data)
                ? data
                : [];
            setMeetings(meetingsArray);
        } catch (error) {
            console.error("Error refreshing meetings:", error);
        }
    };

    // Memoize meeting categorization for performance
    const categorizedMeetings = useMemo(() => {
        const now = new Date();

        // Ensure meetings is always an array
        const meetingsArray = Array.isArray(meetings) ? meetings : [];

        const upcoming = meetingsArray
            .filter((meeting) => {
                const scheduledTime = new Date(meeting.scheduledAt);
                return scheduledTime > now;
            })
            .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

        const ongoing = meetingsArray.filter((meeting) => {
            const scheduledTime = new Date(meeting.scheduledAt);
            const endTime = new Date(
                scheduledTime.getTime() + (meeting.duration || 60) * 60000
            );
            return scheduledTime <= now && endTime > now;
        });

        const past = meetingsArray
            .filter((meeting) => {
                const scheduledTime = new Date(meeting.scheduledAt);
                const endTime = new Date(
                    scheduledTime.getTime() + (meeting.duration || 60) * 60000
                );
                return endTime <= now;
            })
            .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));

        return { upcoming, ongoing, past };
    }, [meetings]);

    const handleJoinMeeting = async (meetingId) => {
        try {
            toast.success("Opening meeting...");
            window.location.href = `/meeting/${meetingId}/room`;
        } catch (error) {
            console.error("Error joining meeting:", error);
            toast.error("Failed to join meeting");
        }
    };
    const getMeetingStatus = (meeting) => {
        const now = new Date();
        const scheduledTime = new Date(meeting.scheduledAt);
        const endTime = new Date(
            scheduledTime.getTime() + (meeting.duration || 60) * 60000
        );

        if (scheduledTime <= now && endTime > now) {
            return { status: "live", label: "Live", variant: "destructive" };
        } else if (endTime <= now) {
            return { status: "ended", label: "Ended", variant: "secondary" };
        } else if (isDateInUserTimezone(scheduledTime, isToday)) {
            return { status: "today", label: "Today", variant: "default" };
        } else if (isDateInUserTimezone(scheduledTime, isTomorrow)) {
            return {
                status: "tomorrow",
                label: "📅 Tomorrow",
                variant: "outline",
            };
        } else {
            return {
                status: "upcoming",
                label: "📅 Scheduled",
                variant: "outline",
            };
        }
    };

    const MeetingCard = ({ meeting }) => {
        const status = getMeetingStatus(meeting);
        const hasTranscript = meeting.transcript && meeting.transcript.content;

        // Safely parse highlights JSON with error handling
        let hasPartialTranscript = false;
        if (meeting.transcript && meeting.transcript.highlights) {
            try {
                const highlights = JSON.parse(meeting.transcript.highlights);
                hasPartialTranscript = highlights.isPartial === true;
            } catch (error) {
                // If highlights is not valid JSON (e.g., markdown), assume it's not partial
                console.warn("Invalid JSON in transcript highlights:", error);
                hasPartialTranscript = false;
            }
        }

        return (
            <Card className="hover:shadow-lg transition-all duration-200 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">
                                {meeting.title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {meeting.description || "No description"}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant={status.variant}>
                                {status.label}
                            </Badge>
                            {meeting.isExternal ? (
                                <Badge variant="secondary" className="text-xs">
                                    <ExternalLinkIcon className="w-3 h-3 mr-1" />
                                    {meeting.externalPlatform || "External"}
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-xs">
                                    <VideoIcon className="w-3 h-3 mr-1" />
                                    LiveKit
                                </Badge>
                            )}
                            {hasPartialTranscript &&
                                status.status === "live" && (
                                    <Badge
                                        variant="default"
                                        className="text-xs bg-blue-600 animate-pulse"
                                    >
                                        <Mic className="w-3 h-3 mr-1" />
                                        Recording
                                    </Badge>
                                )}
                            {hasTranscript && !hasPartialTranscript && (
                                <Badge variant="outline" className="text-xs">
                                    <FileTextIcon className="w-3 h-3 mr-1" />
                                    Recording
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                            <span>
                                {formatInUserTimezone(
                                    meeting.scheduledAt,
                                    "MMM d, yyyy"
                                )}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-muted-foreground" />
                            <span>
                                {formatInUserTimezone(
                                    meeting.scheduledAt,
                                    "h:mm a"
                                )}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <UsersIcon className="w-4 h-4 text-muted-foreground" />
                            <span>
                                {meeting._count?.participants ||
                                    meeting.participants?.length ||
                                    0}{" "}
                                participants
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {status.status === "live" && (
                            <Button
                                onClick={() => handleJoinMeeting(meeting.id)}
                                className="bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-none"
                            >
                                <PlayIcon className="w-4 h-4 mr-2" />
                                Join Live
                            </Button>
                        )}

                        {status.status !== "live" &&
                            status.status !== "ended" &&
                            (meeting.isExternal ? (
                                <Button
                                    onClick={() => {
                                        if (meeting.externalUrl) {
                                            window.open(
                                                meeting.externalUrl,
                                                "_blank"
                                            );
                                            toast.success(
                                                `Opening ${
                                                    meeting.externalPlatform ||
                                                    "external"
                                                } meeting`
                                            );
                                        } else {
                                            toast.error(
                                                "External meeting URL not found"
                                            );
                                        }
                                    }}
                                    variant="outline"
                                    className="flex-1 sm:flex-none"
                                >
                                    <ExternalLinkIcon className="w-4 h-4 mr-2" />
                                    Join External Meeting
                                </Button>
                            ) : (
                                <Button
                                    onClick={() =>
                                        handleJoinMeeting(meeting.id)
                                    }
                                    variant="outline"
                                    className="flex-1 sm:flex-none"
                                >
                                    <VideoIcon className="w-4 h-4 mr-2" />
                                    Join Meeting
                                </Button>
                            ))}

                        {!meeting.isExternal && (
                            <Link
                                href={`/meeting/${meeting.id}/transcript`}
                                className="flex-1 sm:flex-none"
                            >
                                <Button variant="outline" className="w-full">
                                    <FileTextIcon className="w-4 h-4 mr-2" />
                                    {hasPartialTranscript &&
                                    status.status === "live"
                                        ? "Live Transcript"
                                        : hasTranscript
                                        ? "View Transcript"
                                        : "Transcript"}
                                </Button>
                            </Link>
                        )}

                        {meeting.isExternal && (
                            <div className="flex-1 sm:flex-none">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    disabled
                                >
                                    <FileTextIcon className="w-4 h-4 mr-2" />
                                    No Transcript Available
                                </Button>
                            </div>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreVerticalIcon className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/meeting/${meeting.id}`}>
                                        <EyeIcon className="w-4 h-4 mr-2" />
                                        View Details
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        const meetingLink = `${window.location.origin}/meeting/${meeting.id}/room`;
                                        navigator.clipboard.writeText(
                                            meetingLink
                                        );
                                        toast.success("Meeting link copied!");
                                    }}
                                >
                                    <ExternalLinkIcon className="w-4 h-4 mr-2" />
                                    Copy Link
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="h-8 bg-muted rounded animate-pulse w-48"></div>
                    <div className="h-10 bg-muted rounded animate-pulse w-32"></div>
                </div>
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-32 bg-muted rounded animate-pulse"
                        ></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <h2 className="text-2xl font-semibold">Team Meetings</h2>
                    {projects.length > 1 && (
                        <Select
                            value={selectedProjectId}
                            onValueChange={setSelectedProjectId}
                        >
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="All projects" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All projects
                                </SelectItem>
                                {projects.map((project) => (
                                    <SelectItem
                                        key={project.id}
                                        value={project.id}
                                    >
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <CreateMeetingDialog
                        projects={projects}
                        onMeetingCreated={refreshMeetings}
                    >
                        <Button className="flex-1 sm:flex-none">
                            <VideoIcon className="w-4 h-4 mr-2" />
                            Create Meeting
                        </Button>
                    </CreateMeetingDialog>

                    <JoinExternalMeetDialog>
                        <Button
                            variant="outline"
                            className="flex-1 sm:flex-none"
                        >
                            <ExternalLinkIcon className="w-4 h-4 mr-2" />
                            Join External
                        </Button>
                    </JoinExternalMeetDialog>
                </div>
            </div>

            {/* Meetings tabs */}
            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger
                        value="upcoming"
                        className="flex items-center gap-2"
                    >
                        <CalendarIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Upcoming</span>
                        <span className="sm:hidden">Up</span>
                        {categorizedMeetings.upcoming.length > 0 && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                                {categorizedMeetings.upcoming.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value="live"
                        className="flex items-center gap-2"
                    >
                        <PlayIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Live</span>
                        <span className="sm:hidden">Live</span>
                        {categorizedMeetings.ongoing.length > 0 && (
                            <Badge
                                variant="destructive"
                                className="ml-1 text-xs"
                            >
                                {categorizedMeetings.ongoing.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value="past"
                        className="flex items-center gap-2"
                    >
                        <FileTextIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Past</span>
                        <span className="sm:hidden">Past</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4 mt-6">
                    {categorizedMeetings.upcoming.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">
                                    No upcoming meetings
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Create your first meeting to get started
                                </p>
                                <CreateMeetingDialog
                                    projects={projects}
                                    onMeetingCreated={refreshMeetings}
                                >
                                    <Button>
                                        <VideoIcon className="w-4 h-4 mr-2" />
                                        Create Meeting
                                    </Button>
                                </CreateMeetingDialog>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {categorizedMeetings.upcoming.map((meeting) => (
                                <MeetingCard
                                    key={meeting.id}
                                    meeting={meeting}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="live" className="space-y-4 mt-6">
                    {categorizedMeetings.ongoing.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <PlayIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">
                                    No live meetings
                                </h3>
                                <p className="text-muted-foreground">
                                    Live meetings will appear here
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {categorizedMeetings.ongoing.map((meeting) => (
                                <MeetingCard
                                    key={meeting.id}
                                    meeting={meeting}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="past" className="space-y-4 mt-6">
                    {categorizedMeetings.past.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <FileTextIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">
                                    No past meetings
                                </h3>
                                <p className="text-muted-foreground">
                                    Completed meetings will appear here
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {categorizedMeetings.past
                                .slice(0, 10)
                                .map((meeting) => (
                                    <MeetingCard
                                        key={meeting.id}
                                        meeting={meeting}
                                    />
                                ))}
                            {categorizedMeetings.past.length > 10 && (
                                <Card>
                                    <CardContent className="py-4 text-center">
                                        <p className="text-muted-foreground">
                                            {categorizedMeetings.past.length -
                                                10}{" "}
                                            more meetings...
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
