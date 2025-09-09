"use client";

import { useEffect, useRef } from "react";
import { BarLoader } from "react-spinners";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import MDEditor from "@uiw/react-md-editor";
import useFetch from "@/hooks/useFetch";
import { createIssue } from "@/actions/issues";
import { getOrganizationUsers } from "@/actions/organization";
import { issueSchema } from "@/app/lib/schema";

export default function IssueCreationDrawer({
    isOpen,
    onClose,
    sprintId,
    status,
    projectId,
    onIssueCreated,
    orgId,
}) {
    const mdEditorRef = useRef(null);

    const {
        loading: createIssueLoading,
        fn: createIssueFn,
        error,
        data: newIssue,
    } = useFetch(createIssue);

    const {
        loading: usersLoading,
        fn: fetchUsers,
        data: users,
    } = useFetch(getOrganizationUsers);

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(issueSchema),
        defaultValues: {
            priority: "MEDIUM",
            description: "",
            assigneeId: "unassigned",
        },
    });

    useEffect(() => {
        if (isOpen && orgId) {
            fetchUsers(orgId);
        }
    }, [isOpen, orgId]);

    // Enhanced cleanup when drawer closes
    useEffect(() => {
        if (!isOpen) {
            // Reset form when drawer closes
            reset({
                priority: "MEDIUM",
                description: "",
                assigneeId: "unassigned",
            });

            // Force scroll restoration and body cleanup
            const timeoutId = setTimeout(() => {
                // Remove any scroll locks
                document.body.style.removeProperty("overflow");
                document.body.style.removeProperty("padding-right");
                document.documentElement.style.removeProperty("overflow");

                // Ensure the page is scrollable
                document.body.style.overflow = "auto";

                // Force reflow
                document.body.offsetHeight;

                // Restore scroll position
                window.scrollTo({ top: window.scrollY, behavior: "instant" });
            }, 150);

            return () => clearTimeout(timeoutId);
        }
    }, [isOpen, reset]);

    const onSubmit = async (data) => {
        await createIssueFn(projectId, {
            ...data,
            status,
            sprintId,
        });
    };

    useEffect(() => {
        if (newIssue && !createIssueLoading) {
            // Close drawer first
            onClose();

            // Reset form after a short delay
            setTimeout(() => {
                reset({
                    priority: "MEDIUM",
                    description: "",
                    assigneeId: "unassigned",
                });
            }, 200);

            // Call onIssueCreated after drawer is closed
            setTimeout(() => {
                onIssueCreated();
            }, 300);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newIssue, createIssueLoading]);

    return (
        <Drawer
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <DrawerContent className="md:w-1/2 w-full mx-auto bg-neutral-700/20 backdrop-blur-lg p-6 rounded-lg shadow-2xl">
                <DrawerHeader className="mb-4">
                    <DrawerTitle className="text-lg font-semibold text-lime-400 text-center">
                        Create New Issue
                    </DrawerTitle>
                </DrawerHeader>

                {usersLoading && <BarLoader width={"100%"} color="#84cc16" />}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-1">
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-200"
                        >
                            Title
                        </label>
                        <Input
                            id="title"
                            {...register("title")}
                            className="text-gray-50"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.title.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label
                            htmlFor="assigneeId"
                            className="block text-sm font-medium text-gray-200"
                        >
                            Assignee
                        </label>
                        <Controller
                            name="assigneeId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={(value) =>
                                        field.onChange(
                                            value === "unassigned" ? "" : value
                                        )
                                    }
                                    defaultValue={field.value || "unassigned"}
                                    className="bg-gray-100/10 text-gray-50"
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                users?.length > 0
                                                    ? "Select assignee"
                                                    : "No users available"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value="unassigned"
                                            className="text-gray-200"
                                        >
                                            No assignee
                                        </SelectItem>
                                        {users?.map((user) => (
                                            <SelectItem
                                                key={user.id}
                                                value={user.id}
                                                className="text-gray-200"
                                            >
                                                {user?.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.assigneeId && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.assigneeId.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-200"
                        >
                            Description
                        </label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <MDEditor
                                    ref={mdEditorRef}
                                    value={field.value}
                                    onChange={field.onChange}
                                    className="bg-white text-gray-50"
                                    data-color-mode="light"
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-1">
                        <label
                            htmlFor="priority"
                            className="block text-sm font-medium text-gray-200"
                        >
                            Priority
                        </label>
                        <Controller
                            name="priority"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="bg-gray-100/10 text-gray-50"
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value="LOW"
                                            className="text-gray-200"
                                        >
                                            Low
                                        </SelectItem>
                                        <SelectItem
                                            value="MEDIUM"
                                            className="text-gray-200"
                                        >
                                            Medium
                                        </SelectItem>
                                        <SelectItem
                                            value="HIGH"
                                            className="text-gray-200"
                                        >
                                            High
                                        </SelectItem>
                                        <SelectItem
                                            value="URGENT"
                                            className="text-gray-200"
                                        >
                                            Urgent
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={createIssueLoading}
                        className="w-full bg-lime-400 text-black font-semibold hover:bg-lime-500"
                    >
                        {createIssueLoading ? "Creating..." : "Create Issue"}
                    </Button>
                </form>
            </DrawerContent>
        </Drawer>
    );
}
