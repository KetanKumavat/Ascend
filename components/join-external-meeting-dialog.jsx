"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ExternalLinkIcon, VideoIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const externalMeetingSchema = z.object({
    title: z.string().min(1, "Meeting title is required"),
    platform: z.string().min(1, "Platform is required"),
    meetingUrl: z.string().url("Please enter a valid meeting URL"),
    description: z.string().optional(),
});

export function JoinExternalMeetDialog({ children, onMeetingJoined }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(externalMeetingSchema),
        defaultValues: {
            title: "",
            platform: "",
            meetingUrl: "",
            description: "",
        },
    });

    const handleJoinExternalMeeting = async (data) => {
        setIsLoading(true);
        try {
            // Open the external meeting URL in a new tab
            window.open(data.meetingUrl, "_blank");

            // Show success message
            toast.success(
                `🎉 Opened ${data.platform} meeting! Note: No transcription will be provided for external meetings.`
            );

            // Store the external meeting info in localStorage for reference
            const externalMeetingData = {
                ...data,
                joinedAt: new Date().toISOString(),
            };

            localStorage.setItem(
                "currentExternalMeeting",
                JSON.stringify(externalMeetingData)
            );

            // Close dialog and notify parent
            setOpen(false);
            form.reset();

            if (onMeetingJoined) {
                onMeetingJoined(externalMeetingData);
            }
        } catch (error) {
            console.error("Error joining external meeting:", error);
            toast.error("Failed to join external meeting");
        } finally {
            setIsLoading(false);
        }
    };

    const platforms = [
        "Google Meet",
        "Zoom",
        "Microsoft Teams",
        "Slack Huddle",
        "Discord",
        "WebEx",
        "Skype",
        "Other",
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ExternalLinkIcon className="w-5 h-5" />
                        Join External Meeting
                    </DialogTitle>
                    <DialogDescription>
                        Join any external meeting platform. Note: Transcription
                        is only available for LiveKit meetings.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={form.handleSubmit(handleJoinExternalMeeting)}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Meeting Title *
                        </label>
                        <Input
                            {...form.register("title")}
                            placeholder="e.g., Team Standup"
                            disabled={isLoading}
                        />
                        {form.formState.errors.title && (
                            <p className="text-sm text-red-600">
                                {form.formState.errors.title.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Platform *
                        </label>
                        <select
                            {...form.register("platform")}
                            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                            disabled={isLoading}
                        >
                            <option value="">Select platform...</option>
                            {platforms.map((platform) => (
                                <option key={platform} value={platform}>
                                    {platform}
                                </option>
                            ))}
                        </select>
                        {form.formState.errors.platform && (
                            <p className="text-sm text-red-600">
                                {form.formState.errors.platform.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Meeting URL *
                        </label>
                        <Input
                            {...form.register("meetingUrl")}
                            placeholder="https://meet.google.com/abc-defg-hij"
                            disabled={isLoading}
                        />
                        {form.formState.errors.meetingUrl && (
                            <p className="text-sm text-red-600">
                                {form.formState.errors.meetingUrl.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Description (Optional)
                        </label>
                        <Textarea
                            {...form.register("description")}
                            placeholder="Additional notes about this meeting..."
                            rows={2}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-amber-800">
                            <VideoIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                External Meeting Notice
                            </span>
                        </div>
                        <p className="text-xs text-amber-700 mt-1">
                            This will open the meeting in a new tab.
                            Transcription and AI features are only available for
                            LiveKit meetings created on our platform.
                        </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isLoading}
                        >
                            {isLoading ? "Opening..." : "Join Meeting"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
