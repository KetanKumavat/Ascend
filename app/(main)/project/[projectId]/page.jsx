import { getProject } from "@/actions/project";
import { notFound } from "next/navigation";
import React from "react";
import SprintCreationForm from "../_components/create-sprint";
import SprintBoard from "../_components/sprint-board";
import TeamChat from "../_components/team-chat";
import EODReport from "@/components/eod-report";
import ProjectNavigation from "../_components/project-navigation";

const page = async ({ params }) => {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) {
    return notFound();
  }

  const repoUrl = project.repoName || "";

  return (
    <div className="container mx-auto min-h-screen mt-36 mb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <p className="text-muted-foreground">{project.description || "Project workspace"}</p>
      </div>
      
      <ProjectNavigation projectId={projectId} currentPage="overview" />

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
          <EODReport repoUrl={repoUrl} projectId={projectId} />
        </>
      ) : (
        <div>Create a Sprint from button above</div>
      )}

      <TeamChat projectId={projectId} />
    </div>
  );
};

export default page;
