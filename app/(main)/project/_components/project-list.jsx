import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getProjects } from "@/actions/organization";

export default async function ProjectList({ orgId }) {
  const projects = await getProjects(orgId);
  // console.log("projects", projects);

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-neutral-900 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">{project.name}</h2>
            {/* <DeleteProject projectId={project.id} /> */}
          </div>
          <p className="text-sm text-neutral-400 mb-4">{project.description}</p>
          <Link
            href={`/project/${project.id}`}
            className="text-lime-500 hover:underline">
            View Project
          </Link>
        </div>
      ))}
    </div>
  );
}
