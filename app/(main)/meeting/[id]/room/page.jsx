import { notFound } from "next/navigation";
import { getMeeting } from "@/actions/meetings";
import { LiveKitMeetingPage } from "@/components/livekit-meeting-page";

export default async function MeetingRoomPage({ params }) {
    try {
        // Await params to fix Next.js 15 compatibility
        const resolvedParams = await params;
        const pid = resolvedParams.id;

        if (!pid) {
            notFound();
        }

        const meeting = await getMeeting(pid);

        if (!meeting) {
            notFound();
        }

        return (
            <LiveKitMeetingPage
                meetingId={meeting.id}
                meetingTitle={meeting.title}
                meetingDescription={meeting.description}
                scheduledAt={meeting.scheduledAt}
                duration={meeting.duration}
            />
        );
    } catch (error) {
        console.error("Error loading meeting:", error);
        notFound();
    }
}
