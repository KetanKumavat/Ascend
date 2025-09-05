"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { VideoIcon, ExternalLinkIcon, MicIcon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
        watch,
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
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">
                        💡 How this works (100% FREE):
                    </h4>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Enter the Google Meet code shared by your team</li>
                        <li>We&apos;ll open the meeting in a new tab</li>
                        <li>
                            Use our transcript capture to record the meeting
                        </li>
                        <li>Get AI-powered insights and action items</li>
                        <li>Everything saves to your project dashboard</li>
                    </ol>
                </div>

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

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <MicIcon className="w-4 h-4 text-green-600" />
                            <Badge
                                variant="outline"
                                className="text-green-700 border-green-300"
                            >
                                FREE Transcript Features
                            </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs text-green-700">
                            <div>✅ Live speech-to-text</div>
                            <div>✅ AI meeting summary</div>
                            <div>✅ Action items extraction</div>
                            <div>✅ Key points highlights</div>
                        </div>
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
