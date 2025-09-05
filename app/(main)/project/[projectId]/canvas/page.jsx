import { getProject } from "@/actions/project";
import { notFound } from "next/navigation";
import ClientExcalidrawWrapper from "../../../../../components/client-excalidraw-wrapper";
import EnhancedPageHeader from "@/components/ui/enhanced-page-header";
import { createProjectNavigation } from "@/lib/navigation";

export default async function ProjectCanvasPage({ params }) {
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

    const projectNavigation = createProjectNavigation(projectId, "canvas");

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <EnhancedPageHeader
                title={`${project.name} - Canvas`}
                subtitle="Project visual workspace for planning, diagrams, and collaboration"
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
                    { label: "Canvas", icon: "Book" },
                ]}
                projectNavigation={projectNavigation}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                    <ClientExcalidrawWrapper
                        organizationId={project.organizationId}
                        projectId={projectId}
                        title={`${project.name} Canvas`}
                        readOnly={false}
                    />
                </div>
            </main>
        </div>
    );
}
