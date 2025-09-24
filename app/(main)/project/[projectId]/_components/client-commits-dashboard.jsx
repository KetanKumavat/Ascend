"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { updateProject, getProject } from "@/actions/project";

const CommitsDashboard = dynamic(
    () => import("@/components/commits-dashboard"),
    {
        ssr: false,
        loading: () => (
            <div className="animate-pulse h-64 bg-neutral-600 rounded"></div>
        ),
    }
);

export default function ClientCommitsDashboard({ projectId, repoUrl }) {
    const [showModal, setShowModal] = useState(false);
    const [newRepoUrl, setNewRepoUrl] = useState("");

    const handleAddRepoUrl = async () => {
        if (!newRepoUrl.trim()) {
            toast.error("Please enter a valid repository URL");
            return;
        }

        try {
            // Get current project data first
            const currentProject = await getProject(projectId);
            
            // Use the server action with all required fields
            const result = await updateProject({
                id: projectId,
                name: currentProject.name,
                key: currentProject.key,
                description: currentProject.description,
                repoName: newRepoUrl,
            });

            toast.success("Repository URL added successfully!");
            setShowModal(false);
            setNewRepoUrl("");
            window.location.reload();
        } catch (error) {
            console.error("Error updating project:", error);
            toast.error(error.message || "Failed to add repository URL");
        }
    };

    return (
        <>
            <CommitsDashboard 
                projectId={projectId} 
                repoUrl={repoUrl}
                onShowModal={() => setShowModal(true)}
                showModal={showModal}
            />
            
            {/* Add Repository Modal */}
            {showModal && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowModal(false);
                        }
                    }}
                >
                    <Card className="w-full max-w-md border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                        <CardHeader>
                            <CardTitle className="text-neutral-900 dark:text-neutral-100">
                                Add Repository URL
                            </CardTitle>
                            <CardDescription className="text-neutral-600 dark:text-neutral-400">
                                Enter the GitHub repository URL to track commits and enable automated features
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="repoUrl" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Repository URL
                                </label>
                                <input
                                    id="repoUrl"
                                    type="text"
                                    value={newRepoUrl}
                                    onChange={(e) => setNewRepoUrl(e.target.value)}
                                    placeholder="https://github.com/username/repository"
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-colors"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                    className="border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddRepoUrl}
                                    className="bg-lime-500 hover:bg-lime-600 text-black font-medium"
                                >
                                    Save Repository
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}