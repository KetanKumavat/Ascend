import ClientExcalidrawWrapper from "../../../../../components/client-excalidraw-wrapper";
import PageHeader from "@/components/ui/page-header";
import { BaseNavigation } from "@/components/ui/base-navigation";

export default async function OrganizationCanvasPage({ params }) {
    const { orgId } = await params;

    if (!orgId) {
        return <div>Organization not found</div>;
    }

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
            href: `/organization/${orgId}/meetings`,
            icon: "VideoIcon",
        },
        {
            key: "canvas",
            label: "Canvas",
            fullLabel: "Organization Canvas",
            icon: "Book",
        },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto bg-neutral-50 dark:bg-neutral-950">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 pointer-events-none" />

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(163_163_163/0.15)_1px,transparent_0)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(115_115_115/0.15)_1px,transparent_0)] pointer-events-none" />

            <div className="relative">
                <PageHeader
                    title="Organization Canvas"
                    subtitle="Organization-wide visual collaboration, planning, and brainstorming"
                    backHref={`/organization/${orgId}`}
                    breadcrumb={[
                        {
                            label: "Organization",
                            href: `/organization/${orgId}`,
                            icon: "Home",
                        },
                        { label: "Canvas" },
                    ]}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Organization-level Navigation */}
                    <BaseNavigation
                        items={navigationItems}
                        activeItem="canvas"
                        contextLabel="Organization-level view"
                        contextIcon="BarChart3"
                        contextDescription="Strategic planning and cross-project visualization"
                    />

                    <main className="py-6">
                        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                            <ClientExcalidrawWrapper
                                organizationId={orgId}
                                title="Organization Canvas"
                                readOnly={false}
                            />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
