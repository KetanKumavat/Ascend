import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrganization } from "@/actions/organization";
import { getProjects } from "@/actions/project";
import { MeetingsDashboard } from "@/components/meetings-dashboard";
import PageHeader from "@/components/ui/page-header";
import { BaseNavigation } from "@/components/ui/base-navigation";

export default async function MeetingsPage({ params }) {
    const { orgId } = await params;
    const auth_result = await auth();
    const { userId } = auth_result;

    if (!userId) {
        redirect("/sign-in");
    }

    const organization = await getOrganization(orgId);

    if (!organization) {
        return <div>Organization not found</div>;
    }

    // Get projects for the meeting creation dialog
    const projects = await getProjects(orgId);

    const navigationItems = [
        {
            key: "projects",
            label: "Projects",
            href: `/organization/${orgId}`,
            icon: "FolderIcon",
        },
        {
            key: "meetings",
            label: "Meetings",
            fullLabel: "Organization Meetings",
            icon: "VideoIcon",
        },
        {
            key: "canvas",
            label: "Canvas",
            fullLabel: "Organization Canvas",
            href: `/organization/${orgId}/canvas`,
            icon: "Book",
        },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 pointer-events-none" />

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(163_163_163/0.15)_1px,transparent_0)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(115_115_115/0.15)_1px,transparent_0)] pointer-events-none" />

            <div className="relative">
                <PageHeader
                    title="Organization Meetings"
                    subtitle={`${organization.name} • Cross-project collaboration and alignment`}
                    breadcrumb={[
                        {
                            label: "Organization",
                            href: `/organization/${orgId}`,
                            icon: "Home",
                        },
                        { label: "Meetings", icon: "VideoIcon" },
                    ]}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Organization-level Navigation */}
                    <BaseNavigation
                        items={navigationItems}
                        activeItem="meetings"
                        contextLabel="Organization-level view"
                        contextIcon="BarChart3"
                        contextDescription="Meetings across all projects and teams"
                    />

                    <main className="pb-6">
                        <MeetingsDashboard projects={projects} />
                    </main>
                </div>
            </div>
        </div>
    );
}
