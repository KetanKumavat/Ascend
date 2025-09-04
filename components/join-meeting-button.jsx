"use client";

import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";

export function JoinMeetingButton({ meetingUrl, className, size = "lg" }) {
  const handleJoinMeeting = () => {
    if (meetingUrl) {
      window.open(meetingUrl, "_blank");
    }
  };

  return (
    <Button
      size={size}
      className={className}
      onClick={handleJoinMeeting}
    >
      <PlayIcon className="w-5 h-5 mr-2" />
      Join Meeting
    </Button>
  );
}
