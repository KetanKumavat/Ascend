import { notFound } from "next/navigation";
import { getMeeting } from "@/actions/meetings";
import { LiveKitMeetingPage } from "@/components/livekit-meeting-page";
import PageHeader from "@/components/ui/page-header";

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
            <div className="min-h-screen pt-10 bg-neutral-50 dark:bg-neutral-900">
                <PageHeader
                    title={meeting.title}
                    subtitle="LiveKit Video Conference with AI Transcription"
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
                        { label: "Meeting Room", icon: "Video" },
                    ]}
                />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <LiveKitMeetingPage 
                        meetingId={meeting.id}
                        meetingTitle={meeting.title}
                        meetingDescription={meeting.description}
                        scheduledAt={meeting.scheduledAt}
                        duration={meeting.duration}
                    />
                </main>
            </div>
        );
    } catch (error) {
        console.error("Error loading meeting:", error);
        notFound();
    }
}
