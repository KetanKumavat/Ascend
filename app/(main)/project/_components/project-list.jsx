import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getProjects } from "@/actions/organization";
import { Button } from "@/components/ui/button";

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-neutral-900/100 shadow-neutral-800 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-white">{project.name}</h2>
            {/* <DeleteProject projectId={project.id} /> */}
          </div>
          <p className="text-xl text-neutral-400 mb-4">{project.description}</p>
          <Link href={`/project/${project.id}`}>
            <Button className="text-black font-semibold text-lg bg-lime-500 hover:bg-lime-600 transition-all duration-300">
              View Project
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
