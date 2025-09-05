"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { VideoIcon, ExternalLinkIcon } from "lucide-react";
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
import { toast } from "sonner";

const externalMeetSchema = z.object({
    meetingCode: z.string().min(1, "Meeting code is required"),
    title: z.string().min(1, "Meeting title is required"),
    description: z.string().optional(),
});

export function JoinExternalMeetDialog({ onMeetingJoined }) {
    const [open, setOpen] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(externalMeetSchema),
        defaultValues: {
            meetingCode: "",
            title: "",
            description: "",
        },
    });

    const onSubmit = async (data) => {
        setIsJoining(true);
        try {
            // Clean up meeting code (remove any extra characters)
            const cleanCode = data.meetingCode.replace(/[^a-zA-Z0-9-]/g, "");

            // Validate Google Meet code format (typically xxx-yyyy-zzz)
            if (
                !/^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{3}$/.test(
                    cleanCode
                )
            ) {
                throw new Error(
                    "Please enter a valid Google Meet code (format: abc-defg-hij)"
                );
            }

            // Build Google Meet URL
            const meetUrl = `https://meet.google.com/${cleanCode}`;

            // Open Google Meet in new tab
            window.open(meetUrl, "_blank");

            // Show success and instructions
            toast.success(
                `🎉 Opened Google Meet! Use the transcript capture below to record the meeting.`
            );

            // Store meeting info for transcript capture
            const meetingInfo = {
                externalMeetingCode: cleanCode,
                title: data.title,
                description: data.description,
                originalUrl: meetUrl,
                joinedAt: new Date().toISOString(),
            };

            // Save to localStorage for transcript component
            localStorage.setItem(
                "currentExternalMeeting",
                JSON.stringify(meetingInfo)
            );

            setOpen(false);
            reset();

            if (onMeetingJoined) {
                onMeetingJoined(meetingInfo);
            }
        } catch (error) {
            console.error("Error joining external meeting:", error);
            toast.error(error.message || "Failed to join meeting");
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="border-blue-200 text-blue-600 "
                >
                    <VideoIcon className="w-4 h-4 mr-2" />
                    Join Google Meet Code
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ExternalLinkIcon className="w-5 h-5 text-blue-600" />
                        Join External Google Meet
                    </DialogTitle>
                    <DialogDescription>
                        Join any Google Meet using a meeting code and capture
                        FREE transcript with AI insights.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="meetingCode"
                            className="text-sm font-medium"
                        >
                            Google Meet Code *
                        </label>
                        <Input
                            id="meetingCode"
                            placeholder="abc-defg-hij"
                            {...register("meetingCode")}
                            className={
                                errors.meetingCode ? "border-red-500" : ""
                            }
                        />
                        {errors.meetingCode && (
                            <p className="text-sm text-red-500">
                                {errors.meetingCode.message}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Enter the meeting code from the Google Meet
                            invitation
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium">
                            Meeting Title *
                        </label>
                        <Input
                            id="title"
                            placeholder="Weekly Team Standup"
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
                            Description (Optional)
                        </label>
                        <Textarea
                            id="description"
                            placeholder="Meeting purpose and agenda..."
                            rows={2}
                            {...register("description")}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isJoining}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isJoining}
                            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                        >
                            {isJoining ? (
                                <>
                                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                <>
                                    <ExternalLinkIcon className="w-4 h-4 mr-2" />
                                    Join & Start Transcript
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
