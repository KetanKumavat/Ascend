import { getProject } from "@/actions/project";
import { notFound } from "next/navigation";
import React from "react";
import SprintCreationForm from "../_components/create-sprint";
import SprintBoard from "../_components/sprint-board";
import TeamChat from "../_components/team-chat";
import CommitsDashboard from "@/components/commits-dashboard";
import EnhancedPageHeader from "@/components/ui/enhanced-page-header";
import { createProjectNavigation } from "@/lib/navigation";

const page = async ({ params }) => {
    const { projectId } = await params;
    const project = await getProject(projectId);
    if (!project) {
        return notFound();
    }

    const repoUrl = project.repoName || "";
    const projectNavigation = createProjectNavigation(projectId, "overview");

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 pointer-events-none" />
            
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(163_163_163/0.15)_1px,transparent_0)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(115_115_115/0.15)_1px,transparent_0)] pointer-events-none" />

            <div className="relative">
                <EnhancedPageHeader
                    title={project.name}
                    subtitle={project.description || "Project workspace"}
                    backHref={`/organization/${project.organizationId}`}
                    breadcrumb={[
                        {
                            label: "Organization",
                            href: `/organization/${project.organizationId}`,
                            icon: "Home",
                        },
                        { label: project.name, icon: "FolderIcon" },
                    ]}
                    projectNavigation={projectNavigation}
                />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                    <SprintCreationForm
                        projectTitle={project.name}
                        projectId={projectId}
                        projectKey={project.key}
                        sprintKey={project.sprints?.length + 1}
                    />

                    {project.sprints.length > 0 ? (
                        <>
                            <SprintBoard
                                sprints={project.sprints}
                                projectId={projectId}
                                orgId={project.organizationId}
                            />
                            <CommitsDashboard 
                                projectId={projectId} 
                                repoUrl={repoUrl} 
                            />
                        </>
                    ) : (
                        <div className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-lg border border-neutral-200/60 dark:border-neutral-700/60 p-8 text-center shadow-sm">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-neutral-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                                        No Sprints Yet
                                    </h3>
                                    <p className="text-neutral-600 dark:text-neutral-400">
                                        Create your first sprint to start organizing your project tasks and workflow.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <TeamChat projectId={projectId} />
                </main>
            </div>
        </div>
    );
};

export default page;
