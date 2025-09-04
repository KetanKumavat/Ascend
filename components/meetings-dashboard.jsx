"use client";

import { useState, useEffect } from "react";
import { format, isPast, isToday, isTomorrow, isThisWeek } from "date-fns";
import {
  VideoIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  PlayIcon,
  EyeIcon,
  MoreVerticalIcon,
  FileTextIcon,
  SparklesIcon,
  MessageSquareTextIcon,
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
import { CreateMeetingDialog } from "@/components/create-meeting";
import { JoinExternalMeetDialog } from "@/components/join-external-meet-dialog";
import { toast } from "sonner";
import Link from "next/link";
import { useParams } from "next/navigation";

export function MeetingsDashboard({ projects = [] }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const params = useParams();

  useEffect(() => {
    fetchMeetings();
  }, [selectedProjectId]);

  const fetchMeetings = async () => {
    try {
      const url = selectedProjectId 
        ? `/api/meetings?projectId=${selectedProjectId}`
        : "/api/meetings";
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch meetings");
      
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async (meetingId) => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/join`, {
        method: "POST",
      });
      
      if (!response.ok) throw new Error("Failed to join meeting");
      
      const { meetingUrl } = await response.json();
      
      // Open meeting in new tab
      window.open(meetingUrl, "_blank");
      toast.success("Joining meeting...");
    } catch (error) {
      console.error("Error joining meeting:", error);
      toast.error("Failed to join meeting");
    }
  };

  const handleAddDemoTranscript = async (meetingId) => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/demo-transcript`, {
        method: "POST",
      });
      
      if (!response.ok) throw new Error("Failed to add demo transcript");
      
      toast.success("Demo transcript added! Check the meeting details.");
      fetchMeetings(); // Refresh meetings to show transcript indicator
    } catch (error) {
      console.error("Error adding demo transcript:", error);
      toast.error("Failed to add demo transcript");
    }
  };

  const getMeetingStatus = (meeting) => {
    const now = new Date();
    const scheduledTime = new Date(meeting.scheduledAt);
    const endTime = new Date(scheduledTime.getTime() + (meeting.duration || 60) * 60000);

    if (meeting.status === "CANCELLED") return "cancelled";
    if (meeting.status === "COMPLETED") return "completed";
    if (now >= scheduledTime && now <= endTime) return "in-progress";
    if (now > endTime) return "ended";
    return "upcoming";
  };

  const getStatusBadge = (meeting) => {
    const status = getMeetingStatus(meeting);
    
    const statusConfig = {
      "upcoming": { variant: "secondary", label: "Upcoming" },
      "in-progress": { variant: "default", label: "Live", className: "bg-green-600 hover:bg-green-700" },
      "ended": { variant: "outline", label: "Ended" },
      "completed": { variant: "outline", label: "Completed" },
      "cancelled": { variant: "destructive", label: "Cancelled" },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getTimeDescription = (date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isThisWeek(date)) return format(date, "EEEE");
    return format(date, "MMM dd");
  };

  const groupMeetingsByStatus = (meetings) => {
    const now = new Date();
    
    return {
      upcoming: meetings.filter(m => new Date(m.scheduledAt) > now && m.status !== "CANCELLED"),
      live: meetings.filter(m => {
        const start = new Date(m.scheduledAt);
        const end = new Date(start.getTime() + (m.duration || 60) * 60000);
        return now >= start && now <= end && m.status !== "CANCELLED";
      }),
      past: meetings.filter(m => {
        const end = new Date(new Date(m.scheduledAt).getTime() + (m.duration || 60) * 60000);
        return now > end || m.status === "COMPLETED";
      }),
    };
  };

  const MeetingCard = ({ meeting }) => {
    const scheduledDate = new Date(meeting.scheduledAt);
    const status = getMeetingStatus(meeting);
    const canJoin = status === "upcoming" || status === "in-progress";

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <VideoIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{meeting.title}</h3>
              {meeting.project && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                    {meeting.project.key}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {meeting.project.name}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(meeting)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVerticalIcon className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href={`/organization/${params.orgId}/meetings/${meeting.id}`}>
                  <DropdownMenuItem>
                    <EyeIcon className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                </Link>
                {!meeting.transcript && (
                  <DropdownMenuItem onClick={() => handleAddDemoTranscript(meeting.id)}>
                    <FileTextIcon className="w-4 h-4 mr-2" />
                    Add Demo Transcript
                  </DropdownMenuItem>
                )}
                {meeting.transcript && (
                  <>
                    <Link href={`/organization/${params.orgId}/meetings/${meeting.id}`}>
                      <DropdownMenuItem>
                        <FileTextIcon className="w-4 h-4 mr-2" />
                        View Transcript
                      </DropdownMenuItem>
                    </Link>
                    <Link href={`/organization/${params.orgId}/meetings/${meeting.id}`}>
                      <DropdownMenuItem>
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        View Highlights
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {meeting.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {meeting.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {getTimeDescription(scheduledDate)} at {format(scheduledDate, "HH:mm")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span>{meeting.duration || 60}m</span>
              </div>
              <div className="flex items-center gap-1">
                <UsersIcon className="w-4 h-4" />
                <span>{meeting.participants?.length || 0}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {canJoin && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleJoinMeeting(meeting.id)}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <PlayIcon className="w-4 h-4 mr-1" />
                    Join Meeting
                  </Button>
                  
                  <Link href={`/meeting/${meeting.id}/transcript`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <MessageSquareTextIcon className="w-4 h-4 mr-1" />
                      Live Transcript
                    </Button>
                  </Link>
                </>
              )}
              
              {!canJoin && meeting.meetingUrl && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    🎥 Video Meeting (FREE)
                  </Badge>
                  
                  {meeting.transcript && (
                    <Link href={`/organization/${params.orgId}/meetings/${meeting.id}`}>
                      <Button size="sm" variant="outline">
                        <FileTextIcon className="w-4 h-4 mr-1" />
                        View Transcript
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const groupedMeetings = groupMeetingsByStatus(meetings);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meetings</h1>
          <p className="text-muted-foreground">
            Create FREE meetings with unlimited participants, live transcription, and AI insights
          </p>
        </div>
        <div className="flex gap-3">
          <CreateMeetingDialog 
            projects={projects} 
            onMeetingCreated={fetchMeetings}
          />
          <JoinExternalMeetDialog 
            onMeetingJoined={(meetingInfo) => {
              console.log("External meeting joined:", meetingInfo);
              // Optionally refresh meetings list to show captured external meetings
              fetchMeetings();
            }}
          />
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming" className="relative">
            Upcoming
            {groupedMeetings.upcoming.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {groupedMeetings.upcoming.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="live" className="relative">
            Live
            {groupedMeetings.live.length > 0 && (
              <Badge variant="default" className="ml-2 h-5 w-5 p-0 text-xs bg-green-600">
                {groupedMeetings.live.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {groupedMeetings.upcoming.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <VideoIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming meetings</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Schedule your first team meeting to get started with collaboration.
                </p>
                <CreateMeetingDialog 
                  projects={projects} 
                  onMeetingCreated={fetchMeetings}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {groupedMeetings.upcoming.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          {groupedMeetings.live.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <PlayIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No live meetings</h3>
                <p className="text-muted-foreground">
                  No meetings are currently in progress.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {groupedMeetings.live.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {groupedMeetings.past.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No past meetings</h3>
                <p className="text-muted-foreground">
                  Your meeting history will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {groupedMeetings.past.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
