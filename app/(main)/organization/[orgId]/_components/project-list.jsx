"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects } from "@/actions/organization";
import { Button } from "@/components/ui/button";
import DeleteProject from "./delete-project";
import { FolderIcon, Plus } from "lucide-react";

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
            <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-neutral-300 dark:border-neutral-600 border-t-neutral-600 dark:border-t-neutral-300 rounded-full animate-spin"></div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Loading projects...
                    </p>
                </div>
            </div>
        );
    }

    if (projects?.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FolderIcon className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    No projects yet
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                    Get started by creating your first project
                </p>
                <Link href={`/project/create?orgId=${orgId}`}>
                    <Button className="bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Project
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Create Project Button */}
            <div className="flex justify-between items-center">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {projects?.length}{" "}
                    {projects?.length === 1 ? "project" : "projects"}
                </div>
                <Link href={`/project/create?orgId=${orgId}`}>
                    <Button
                        variant="outline"
                        className="border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 bg-neutral-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Project
                    </Button>
                </Link>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects?.map((project) => (
                    <div
                        key={project.id}
                        className="group bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 p-6 hover:shadow-sm"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {project.name}
                            </h3>
                            <DeleteProject
                                projectId={project.id}
                                onDelete={handleDeleteProject}
                            />
                        </div>

                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 line-clamp-3">
                            {project.description || "No description provided"}
                        </p>

                        <Link href={`/project/${project.id}`} className="block">
                            <Button
                                variant="ghost"
                                className="w-full justify-start p-0 h-auto text-left hover:bg-transparent group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm"
                            >
                                View Project →
                            </Button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectList;
