"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/actions/project";
import { Button } from "@/components/ui/button";
import { projectSchema } from "@/app/lib/schema.js";
import { z } from "zod";
import { useOrganization, useUser } from "@clerk/nextjs";
import OrgSwitcher from "@/components/org-switcher";
import { toast } from "sonner";

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 md:mt-12 mt-32 text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 to-neutral-400">
        Create Project
      </h1>
      {errors.form && <div className="text-red-500 mb-4">{errors.form}</div>}
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-neutral-800/50 border-2 border-gray-900/50 shadow-neutral-700/40 p-12 rounded-lg shadow-lg">
        <div className="mb-6">
          <label
            htmlFor="name"
            className="block text-white text-lg font-semibold mb-2">
            Project Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-6 py-3 border border-neutral-700 rounded-md bg-neutral-800 text-white focus:outline-none focus:border-lime-500"
            placeholder="My Awesome Project"
            required
          />
          {errors.name && (
            <div className="text-red-500 mt-2">{errors.name}</div>
          )}
        </div>
        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-white text-lg font-semibold mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-6 py-3 border border-neutral-700 rounded-md bg-neutral-800 text-white focus:outline-none focus:border-lime-500"
            placeholder="A brief description of your project"
            rows="6"></textarea>
          {errors.description && (
            <div className="text-red-500 mt-2">{errors.description}</div>
          )}
        </div>
        <div className="mb-6">
          <label
            htmlFor="key"
            className="block text-white text-lg font-semibold mb-2">
            Project Key
          </label>
          <input
            type="text"
            id="key"
            name="key"
            value={formData.key}
            onChange={handleChange}
            className="w-full px-6 py-3 border border-neutral-700 rounded-md bg-neutral-800 text-white focus:outline-none focus:border-lime-500"
            placeholder="my-awesome-project"
            required
          />
          {errors.key && <div className="text-red-500 mt-2">{errors.key}</div>}
        </div>
        <div className="mb-6">
          <label
            htmlFor="name"
            className="block text-white text-lg font-semibold mb-2">
            Github Repo Name <span className="text-sm ">(Optional)</span>
          </label>
          <input
            type="text"
            id="repoName"
            name="repoName"
            value={formData.repoName}
            onChange={handleChange}
            className="w-full px-6 py-3 border border-neutral-700 rounded-md bg-neutral-800 text-white focus:outline-none focus:border-lime-500"
            placeholder="my-awesome-project"
          />
          {errors.repoName && (
            <div className="text-red-500 mt-2">{errors.repoName}</div>
          )}
        </div>
        <Button
          type="submit"
          className="w-full py-6 bg-lime-500 text-black text-xl font-semibold rounded-md hover:bg-lime-600 transition-all duration-300">
          Create Project
        </Button>
      </form>
    </div>
  );
};

export default CreateProject;
