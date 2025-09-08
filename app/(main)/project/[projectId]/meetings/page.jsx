import { getProject } from "@/actions/project";
import { notFound } from "next/navigation";
import { MeetingsDashboard } from "@/components/meetings-dashboard";
import EnhancedPageHeader from "@/components/ui/enhanced-page-header";
import { createProjectNavigation } from "@/lib/navigation";

export default async function ProjectMeetingsPage({ params }) {
    const { projectId } = await params;

    if (!projectId) {
        return notFound();
    }

    let project;
    try {
        project = await getProject(projectId);
    } catch (error) {
        return notFound();
    }

    const projectNavigation = createProjectNavigation(projectId, "meetings");

    return (
        <div className="min-h-screen">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 pointer-events-none" />

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(163_163_163/0.15)_1px,transparent_0)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(115_115_115/0.15)_1px,transparent_0)] pointer-events-none" />

            <div className="relative">
                <EnhancedPageHeader
                    title={`${project.name} - Meetings`}
                    subtitle="Project meetings and collaboration sessions"
                    backHref={`/organization/${project.organizationId}`}
                    breadcrumb={[
                        {
                            label: "Organization",
                            href: `/organization/${project.organizationId}`,
                            icon: "Home",
                        },
                        {
                            label: project.name,
                            href: `/project/${projectId}`,
                            icon: "FolderIcon",
                        },
                        { label: "Meetings", icon: "VideoIcon" },
                    ]}
                    projectNavigation={projectNavigation}
                />
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative w-full">
                <MeetingsDashboard projects={[project]} />
            </main>
        </div>
    );
}
