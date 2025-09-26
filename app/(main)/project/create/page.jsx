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
        <div className="pt-16">
            <div className="mx-auto px-4 py-16">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 text-transparent text-white">
                        Create Project
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                        Start your next big idea with a new project. Configure
                        your settings and connect your repository.
                    </p>
                </div>

                {/* Form Container */}
                <div className="max-w-xl mx-auto">
                    {errors.form && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {errors.form}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Form Card */}
                        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-8 shadow-2xl">
                            {/* Project Name */}
                            <div className="space-y-3">
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-neutral-200"
                                >
                                    Project Name
                                    <span className="text-red-400 ml-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all duration-200 hover:border-neutral-600"
                                    placeholder="My Awesome Project"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-red-400 text-sm mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-3 mt-6">
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-neutral-200"
                                >
                                    Description
                                    <span className="text-red-400 ml-1">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all duration-200 hover:border-neutral-600 resize-none"
                                    placeholder="A brief description of your project..."
                                    rows="4"
                                    required
                                />
                                {errors.description && (
                                    <p className="text-red-400 text-sm mt-1">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Project Key */}
                            <div className="space-y-3 mt-6">
                                <label
                                    htmlFor="key"
                                    className="block text-sm font-medium text-neutral-200"
                                >
                                    Project Key
                                    <span className="text-red-400 ml-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="key"
                                    name="key"
                                    value={formData.key}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all duration-200 hover:border-neutral-600"
                                    placeholder="my-awesome-project"
                                    required
                                />
                                <p className="text-neutral-500 text-xs">
                                    Used for project identification. Should be
                                    lowercase with hyphens.
                                </p>
                                {errors.key && (
                                    <p className="text-red-400 text-sm mt-1">
                                        {errors.key}
                                    </p>
                                )}
                            </div>

                            {/* GitHub Repository */}
                            <div className="space-y-3 mt-6">
                                <div className="flex items-center space-x-2">
                                    <label
                                        htmlFor="repoName"
                                        className="block text-sm font-medium text-neutral-200"
                                    >
                                        GitHub Repository
                                    </label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-4 w-4 text-lime-500 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent
                                                side="top"
                                                className="bg-neutral-800 border-neutral-700"
                                            >
                                                <p className="text-sm">
                                                    Repository link enables
                                                    automated daily report
                                                    generation
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="repoName"
                                        name="repoName"
                                        value={formData.repoName}
                                        onChange={handleChange}
                                        className="w-full pl-20 pr-4 py-3 bg-neutral-950/50 border border-neutral-700/50 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all duration-200 hover:border-neutral-600"
                                        placeholder="github.com/username/repository"
                                    />
                                </div>
                                <p className="text-neutral-500 text-xs">
                                    Optional: Connect your GitHub repository for
                                    enhanced features
                                </p>
                                {errors.repoName && (
                                    <p className="text-red-400 text-sm mt-1">
                                        {errors.repoName}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-lime-500 to-lime-400 hover:from-lime-400 hover:to-lime-300 text-black font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-lime-500/25 transform hover:scale-[1.02] active:scale-[0.98]"
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
