"use client";
import React from "react";
import { useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteProject } from "@/actions/project";
import { toast } from "sonner";

const DeleteProject = ({ projectId, onDelete }) => {
  const { membership } = useOrganization();

  const isAdmin = membership && membership.role === "org:admin";

  if (!isAdmin) {
    return null;
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(projectId);
        toast.success("Project deleted successfully");
        onDelete(projectId);
      } catch (error) {
        toast.error("Failed to delete project");
      }
    }
  };

  return (
    <Button variant="ghost" onClick={handleDelete}>
      <Trash2 className="w-8 h-8" size={22} />
    </Button>
  );
};

export default DeleteProject;
