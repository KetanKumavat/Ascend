"use client";

import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { useRouter } from "next/navigation";

export function JoinMeetingButton({ meetingId, className, size = "lg" }) {
  const router = useRouter();

  const handleJoinMeeting = () => {
    if (meetingId) {
      router.push(`/meeting/${meetingId}/room`);
    }
  };

  return (
    <Button
      size={size}
      className={className}
      onClick={handleJoinMeeting}
    >
      <Video className="w-5 h-5 mr-2" />
      Join Meeting
    </Button>
  );
}
