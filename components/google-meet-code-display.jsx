"use client";

import { useState, useEffect } from "react";
import { VideoIcon, CopyIcon, ExternalLinkIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function GoogleMeetCodeDisplay({ meetingId, className = "" }) {
  const [meetingAccess, setMeetingAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetingAccess = async () => {
      try {
        const response = await fetch(`/api/meetings/${meetingId}/access`);
        if (response.ok) {
          const data = await response.json();
          setMeetingAccess(data);
        }
      } catch (error) {
        console.error("Error fetching meeting access:", error);
      } finally {
        setLoading(false);
      }
    };

    if (meetingId) {
      fetchMeetingAccess();
    }
  }, [meetingId]);

  const handleCopyMeetCode = () => {
    if (meetingAccess?.meetCode) {
      navigator.clipboard.writeText(meetingAccess.meetCode);
      toast.success("Meeting code copied to clipboard!");
    }
  };

  const handleCopyMeetLink = () => {
    if (meetingAccess?.meetingUrl) {
      navigator.clipboard.writeText(meetingAccess.meetingUrl);
      toast.success("Meeting link copied to clipboard!");
    }
  };

  const handleJoinMeeting = () => {
    if (meetingAccess?.meetingUrl) {
      window.open(meetingAccess.meetingUrl, "_blank");
      toast.success("Opening meeting...");
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!meetingAccess || !meetingAccess.canJoin) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <VideoIcon className="w-5 h-5 text-blue-600" />
          Google Meet Access
          {meetingAccess.isParticipant && (
            <Badge variant="secondary" className="text-xs">Participant</Badge>
          )}
          {meetingAccess.isAdmin && (
            <Badge variant="default" className="text-xs">Admin</Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {meetingAccess.meetCode && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Meeting Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-lg tracking-wider">
                {meetingAccess.meetCode}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopyMeetCode}
                className="shrink-0"
              >
                <CopyIcon className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this code to join the meeting manually in Google Meet
            </p>
          </div>
        )}

        {meetingAccess.meetingUrl && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Meeting Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm truncate">
                {meetingAccess.meetingUrl}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopyMeetLink}
                className="shrink-0"
              >
                <CopyIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleJoinMeeting}
            className="flex-1"
            disabled={!meetingAccess.meetingUrl}
          >
            <VideoIcon className="w-4 h-4 mr-2" />
            Join Meeting
          </Button>
          
          {meetingAccess.meetingUrl && (
            <Button 
              variant="outline"
              onClick={() => window.open(meetingAccess.meetingUrl, "_blank")}
            >
              <ExternalLinkIcon className="w-4 h-4" />
            </Button>
          )}
        </div>

        {!meetingAccess.isParticipant && (
          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
            <EyeIcon className="w-4 h-4 inline mr-1" />
            You can view this meeting code as a team member. Ask an admin to add you as a participant for full access.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
