import { getProject } from "@/actions/project";
import { notFound } from "next/navigation";
import React from "react";
import SprintCreationForm from "../_components/create-sprint";
import SprintBoard from "../_components/sprint-board";
import TeamChat from "../_components/team-chat";
import EODReport from "@/components/eod-report";

const page = async ({ params }) => {
  const { projectId } = await params;
  const project = await getProject(projectId);
  const githubUsername = "ketankumavat";
  const githubRepo = "ascend";
  if (!project) {
    return notFound();
  }

  return (
    <div className="container mx-auto min-h-screen mt-36 mb-24">
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
          <EODReport username={githubUsername} repo={githubRepo} />
        </>
      ) : (
        <div>Create a Sprint from button above</div>
      )}

      <TeamChat projectId={projectId} />
    </div>
  );
};

export default page;
