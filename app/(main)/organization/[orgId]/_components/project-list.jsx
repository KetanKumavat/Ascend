"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects } from "@/actions/organization";
import { Button } from "@/components/ui/button";
import DeleteProject from "./delete-project";
import ClipLoader from "react-spinners/ClipLoader";

const ProjectList = ({ orgId }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projects = await getProjects(orgId);
        setProjects(projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [orgId]);

  const handleDeleteProject = (deletedProjectId) => {
    setProjects((prevProjects) =>
      prevProjects.filter((project) => project.id !== deletedProjectId)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <ClipLoader color="#84cc16" size={50} />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <p className="min-h-fit text-2xl font-semibold flex justify-center items-center">
          No projects found.
        </p>
        <Link
          className="underline underline-offset-2 text-blue-200 mt-4"
          href="/project/create">
          Create New.
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-neutral-800 shadow-neutral-800 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-white">{project.name}</h2>
            <DeleteProject
              projectId={project.id}
              onDelete={handleDeleteProject}
            />
          </div>
          <p className="text-xl text-neutral-400 mb-4 break-words overflow-hidden">
            {project.description}
          </p>
          <Link href={`/project/${project.id}`}>
            <Button className="text-black font-semibold text-md bg-lime-500 hover:bg-lime-600 transition-all duration-300 mt-10">
              View Project
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
