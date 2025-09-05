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
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <MeetingsDashboard projects={[project]} />
            </main>
        </div>
    );
}
