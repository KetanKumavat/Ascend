"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/actions/project";
import { Button } from "@/components/ui/button";
import { projectSchema } from "@/app/lib/schema.js";
import { z } from "zod";
import { useOrganization, useUser } from "@clerk/nextjs";
import OrgSwitcher from "@/components/org-switcher";
import { toast } from "sonner";
import { Info } from "lucide-react";

const CreateProject = () => {
    const { isLoaded: isOrgLoaded, membership } = useOrganization();
    const { isLoaded: isUserLoaded } = useUser();

    const [isAdmin, setIsAdmin] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        key: "",
        repoName: "",
    });
    const [errors, setErrors] = useState({});
    const router = useRouter();

    useEffect(() => {
        if (isOrgLoaded && isUserLoaded) {
            setIsAdmin(membership.role === "org:admin");
        }
    }, [isOrgLoaded, isUserLoaded, membership]);

    if (!isOrgLoaded || !isUserLoaded) {
        return null;
    }

    if (!isAdmin) {
        return (
            <div className="relative container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
                <div className="absolute top-[10rem] right-4">
                    <OrgSwitcher />
                </div>
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-8 mt-12 text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 via-neutral-500 to-neutral-400">
                        Create Project
                    </h1>
                    <div className="text-red-500 mb-4 mt-6 text-2xl font-semibold">
                        Oops! Only organization admins can create projects ☹️
                    </div>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            projectSchema.parse(formData);
            const response = await createProject(formData);
            toast.success("Project created successfully");
            router.push(`/project/${response.id}`);
        } catch (err) {
            if (err instanceof z.ZodError) {
                const fieldErrors = {};
                err.errors.forEach((error) => {
                    fieldErrors[error.path[0]] = error.message;
                });
                toast.error("Form has errors");
                setErrors(fieldErrors);
            } else {
                setErrors({ form: err.message });
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-white mb-2">
                        Create a new project
                    </h1>
                    <p className="text-sm text-neutral-400"></p>
                </div>

                {/* Form Card */}
                <div className="bg-black border border-neutral-800 rounded-lg p-6 shadow-xl">
                    {errors.form && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-xs">
                            {errors.form}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Project Name */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="name"
                                className="block text-xs font-medium text-neutral-300"
                            >
                                Project Name{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm bg-black border border-neutral-700 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 transition-colors"
                                placeholder="My Awesome Project"
                                required
                            />
                            {errors.name && (
                                <p className="text-red-400 text-xs mt-1">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="description"
                                className="block text-xs font-medium text-neutral-300"
                            >
                                Description{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm bg-black border border-neutral-700 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 transition-colors resize-none"
                                placeholder="Brief description of your project"
                                rows="3"
                                required
                            />
                            {errors.description && (
                                <p className="text-red-400 text-xs mt-1">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Project Key */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="key"
                                className="block text-xs font-medium text-neutral-300"
                            >
                                Project Key{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="key"
                                name="key"
                                value={formData.key}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm bg-black border border-neutral-700 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 transition-colors"
                                placeholder="my-project"
                                required
                            />
                            <p className="text-neutral-500 text-xs">
                                Lowercase with hyphens
                            </p>
                            {errors.key && (
                                <p className="text-red-400 text-xs mt-1">
                                    {errors.key}
                                </p>
                            )}
                        </div>

                        {/* GitHub Repository */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <label
                                    htmlFor="repoName"
                                    className="block text-xs font-medium text-neutral-300"
                                >
                                    GitHub Repository
                                </label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3.5 w-3.5 text-neutral-500 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side="top"
                                            className="bg-neutral-900 border-neutral-700 text-xs max-w-xs"
                                        >
                                            <p>
                                                Enables automated commit sync
                                                and daily reports
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <input
                                type="text"
                                id="repoName"
                                name="repoName"
                                value={formData.repoName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm bg-black border border-neutral-700 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 transition-colors"
                                placeholder="github.com/username/repo"
                            />
                            <p className="text-neutral-500 text-xs">Optional</p>
                            {errors.repoName && (
                                <p className="text-red-400 text-xs mt-1">
                                    {errors.repoName}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full mt-6 h-9 bg-white hover:bg-neutral-200 text-black text-sm font-medium rounded-md transition-colors"
                        >
                            Create Project
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateProject;
