import { getProject } from "@/actions/project";
import { notFound } from "next/navigation";
import ProjectNavigation from "../../_components/project-navigation";
import ClientExcalidrawWrapper from "../../../../../components/client-excalidraw-wrapper";

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

  return (
    <div className="container mx-auto mt-36 mb-24 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{project.name} - Canvas</h1>
        <p className="text-muted-foreground">
          Project visual workspace for planning, diagrams, and collaboration
        </p>
      </div>
      
      <ProjectNavigation projectId={projectId} currentPage="canvas" />

      <ClientExcalidrawWrapper
        organizationId={project.organizationId}
        projectId={projectId}
        title={`${project.name} Canvas`}
        readOnly={false}
      />
    </div>
  );
}
