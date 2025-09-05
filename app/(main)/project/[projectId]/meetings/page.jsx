import { getProject } from "@/actions/project";
import { notFound } from "next/navigation";
import ProjectNavigation from "../../_components/project-navigation";
import { MeetingsDashboard } from "@/components/meetings-dashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, FolderIcon } from "lucide-react";
import Link from "next/link";

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

    return (
        <div className="container mx-auto mt-36 mb-24 space-y-6">
            {/* Navigation Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link 
                    href={`/organization/${project.organizationId}`}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                    <Home className="w-4 h-4" />
                    Organization
                </Link>
                <span>/</span>
                <Link 
                    href={`/project/${projectId}`}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                    <FolderIcon className="w-4 h-4" />
                    Project
                </Link>
                <span>/</span>
                <span className="text-foreground">Meetings</span>
            </div>

            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Link href={`/project/${projectId}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Project
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{project.name} - Meetings</h1>
                        <p className="text-muted-foreground">
                            Project meetings and collaboration sessions
                        </p>
                    </div>
                </div>
            </div>
            
            <ProjectNavigation projectId={projectId} currentPage="meetings" />

            <MeetingsDashboard projects={[project]} />
        </div>
    );
}
