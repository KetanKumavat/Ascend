"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, VideoIcon, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const meetingSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    scheduledAt: z.string().min(1, "Meeting time is required"),
    duration: z
        .number()
        .min(15, "Minimum duration is 15 minutes")
        .max(480, "Maximum duration is 8 hours"),
    projectId: z.string().optional(),
});

export function CreateMeetingDialog({ projects = [], onMeetingCreated }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm({
        resolver: zodResolver(meetingSchema),
        defaultValues: {
            title: "",
            description: "",
            duration: 60,
            projectId: "",
        },
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/meetings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    projectId:
                        data.projectId && data.projectId !== "none"
                            ? data.projectId
                            : null,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create meeting");
            }

            const meeting = await response.json();
            toast.success(
                "🎉 FREE meeting created successfully! Room ready for unlimited participants."
            );

            setOpen(false);
            reset();

            if (onMeetingCreated) {
                onMeetingCreated(meeting);
            }
        } catch (error) {
            console.error("Error creating meeting:", error);
            toast.error(error.message || "Failed to create meeting");
        } finally {
            setIsLoading(false);
        }
    };

    const durations = [
        { value: 15, label: "15 minutes" },
        { value: 30, label: "30 minutes" },
        { value: 45, label: "45 minutes" },
        { value: 60, label: "1 hour" },
        { value: 90, label: "1.5 hours" },
        { value: 120, label: "2 hours" },
        { value: 180, label: "3 hours" },
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <VideoIcon className="w-4 h-4 mr-2" />
                    Create Meeting
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <VideoIcon className="w-5 h-5 text-blue-600" />
                        Schedule New Meeting
                    </DialogTitle>
                    <DialogDescription>
                        Create a FREE video meeting session with unlimited
                        participants, live transcription, and AI-powered
                        insights.
                    </DialogDescription>
                </DialogHeader>

                {/* FREE Features Banner */}
                {/* <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                        🎉 What you get for FREE with Video Meetings:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Unlimited participants
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            No time limits
                        </div>
                        <div>✅ HD video & audio</div>
                        <div>✅ Screen sharing</div>
                        <div>✅ Live transcription</div>
                        <div>✅ AI meeting insights</div>
                        <div>✅ Local recording</div>
                        <div>✅ Mobile app support</div>
                    </div>
                </div> */}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium">
                            Meeting Title *
                        </label>
                        <Input
                            id="title"
                            placeholder="Sprint Planning Meeting"
                            {...register("title")}
                            className={errors.title ? "border-red-500" : ""}
                        />
                        {errors.title && (
                            <p className="text-sm text-red-500">
                                {errors.title.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="description"
                            className="text-sm font-medium"
                        >
                            Description
                        </label>
                        <Textarea
                            id="description"
                            placeholder="Discuss upcoming sprint goals and task assignments..."
                            rows={3}
                            {...register("description")}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="scheduledAt"
                                className="text-sm font-medium flex items-center gap-2"
                            >
                                <CalendarIcon className="w-4 h-4" />
                                Date & Time *
                            </label>
                            <Input
                                id="scheduledAt"
                                type="datetime-local"
                                {...register("scheduledAt")}
                                className={`text-white ${
                                    errors.scheduledAt ? "border-red-500" : ""
                                }`}
                                min={new Date().toISOString().slice(0, 16)}
                            />
                            {errors.scheduledAt && (
                                <p className="text-sm text-red-500">
                                    {errors.scheduledAt.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="duration"
                                className="text-sm font-medium flex items-center gap-2"
                            >
                                <Clock className="w-4 h-4" />
                                Duration
                            </label>
                            <Select
                                value={watch("duration")?.toString()}
                                onValueChange={(value) =>
                                    setValue("duration", parseInt(value))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    {durations.map((duration) => (
                                        <SelectItem
                                            key={duration.value}
                                            value={duration.value.toString()}
                                        >
                                            {duration.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.duration && (
                                <p className="text-sm text-red-500">
                                    {errors.duration.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {projects && projects.length > 0 && (
                        <div className="space-y-2">
                            <label
                                htmlFor="project"
                                className="text-sm font-medium flex items-center gap-2"
                            >
                                <Users className="w-4 h-4" />
                                Project (Optional)
                            </label>
                            <Select
                                value={watch("projectId")}
                                onValueChange={(value) =>
                                    setValue("projectId", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a project" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        No specific project
                                    </SelectItem>
                                    {projects.map((project) => (
                                        <SelectItem
                                            key={project.id}
                                            value={project.id}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                                                    {project.key}
                                                </span>
                                                {project.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <VideoIcon className="w-4 h-4 mr-2" />
                                    Create Meeting
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
