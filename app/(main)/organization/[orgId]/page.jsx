import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrganization } from "@/actions/organization";
import OrgSwitcher from "@/components/org-switcher";
import ProjectList from "./_components/project-list";
import UserIssues from "./_components/user-issues";
import { BaseNavigation } from "@/components/ui/base-navigation";
import { ContentCard } from "@/components/ui/content-card";
import { FolderIcon, Building2, Users } from "lucide-react";

export default async function OrganizationPage({ params }) {
    const { orgId } = await params;
    const auth_result = await auth();
    const { userId } = auth_result;

    if (!userId) {
        redirect("/sign-in");
    }

    // console.log("OrganizationPage - orgId:", orgId, "userId:", userId);

    const organization = await getOrganization(orgId);

    // console.log("OrganizationPage - organization result:", organization);

    if (!organization) {
        // console.log("OrganizationPage - No organization found, showing error");
        return <div>Organization not found</div>;
    }

    // console.log("OrganizationPage - Organization found, proceeding with render");

    const navigationItems = [
        {
            key: "projects",
            label: "Projects",
            icon: "FolderIcon",
        },
        {
            key: "meetings",
            label: "Meetings",
            fullLabel: "Organization Meetings",
            href: `/organization/${organization.id}/meetings`,
            icon: "VideoIcon",
        },
        {
            key: "canvas",
            label: "Canvas",
            fullLabel: "Organization Canvas",
            href: `/organization/${organization.id}/canvas`,
            icon: "Book",
        },
    ];

    return (
        <div className="pt-10 max-w-7xl mx-auto bg-neutral-50 dark:bg-neutral-950">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 pointer-events-none" />

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(163_163_163/0.15)_1px,transparent_0)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(115_115_115/0.15)_1px,transparent_0)] pointer-events-none" />

            <div className="relative w-full px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <header className="pt-16 pb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                <Building2 className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                                    {organization.name}
                                </h1>
                                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                                    Organization Dashboard
                                </p>
                            </div>
                        </div>
                        <OrgSwitcher />
                    </div>
                </header>

                {/* Organization-level Navigation */}
                <BaseNavigation
                    items={navigationItems}
                    activeItem="projects"
                    contextLabel="Organization-level view"
                    contextIcon="BarChart3"
                    contextDescription="Cross-project collaboration and management"
                />

                {/* Main Content Grid */}
                <div className="grid gap-8">
                    {/* Projects Section */}
                    <ContentCard
                        title="Projects"
                        description="Manage and oversee all projects in your organization"
                        icon={FolderIcon}
                    >
                        <ProjectList orgId={organization.id} />
                    </ContentCard>

                    {/* User Issues Section */}
                    <ContentCard
                        title="Your Issues"
                        description="Issues assigned to you across all projects"
                        icon={Users}
                    >
                        <UserIssues userId={userId} />
                    </ContentCard>
                </div>

                {/* Footer spacing */}
                <div className="h-20" />
            </div>
        </div>
    );
}
