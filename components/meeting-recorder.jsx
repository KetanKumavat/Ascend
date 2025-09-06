"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Clock, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function MeetingRecorder({
    meetingId,
    meetingTitle,
    onRecordingComplete,
}) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [isSupported, setIsSupported] = useState(true);

    const mediaRecorderRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Check if browser supports MediaRecorder
    useEffect(() => {
        if (!navigator.mediaDevices || !window.MediaRecorder) {
            setIsSupported(false);
            toast.error(
                "Audio recording not supported in this browser. Please use Chrome or Firefox."
            );
        }
    }, []);

    // Request microphone access and system audio capture
    const initializeRecording = async () => {
        try {
            // Try to get system audio first (screen share with audio)
            let stream;
            try {
                stream = await navigator.mediaDevices.getDisplayMedia({
                    video: false,
                    audio: {
                        echoCancellation: false,
                        noiseSuppression: false,
                        autoGainControl: false,
                    },
                });
                toast.success(
                    "System audio capture enabled - all meeting audio will be recorded"
                );
            } catch (error) {
                console.log(
                    "System audio not available, falling back to microphone"
                );
                // Fallback to microphone
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: false,
                        noiseSuppression: false,
                        autoGainControl: false,
                        sampleRate: 44100,
                    },
                });
                toast.info(
                    "Recording from microphone - ensure you're close to the mic"
                );
            }

            mediaStreamRef.current = stream;

            // Create MediaRecorder instance
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm;codecs=opus",
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            // Handle data available
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            // Handle recording stop
            mediaRecorder.onstop = async () => {
                console.log("Recording stopped, processing audio...");
                await processRecording();
            };

            return true;
        } catch (error) {
            console.error("Failed to initialize recording:", error);
            toast.error(
                "Failed to access microphone. Please allow microphone permissions."
            );
            return false;
        }
    };

    // Start recording
    const startRecording = async () => {
        if (!isSupported) {
            toast.error("Recording not supported in this browser");
            return;
        }

        const initialized = await initializeRecording();
        if (!initialized) return;

        try {
            mediaRecorderRef.current.start(1000); // Collect data every second
            setIsRecording(true);
            setStartTime(new Date());

            // Update meeting status to IN_PROGRESS
            await fetch(`/api/meetings/${meetingId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "IN_PROGRESS" }),
            });

            toast.success("Meeting recording started");
        } catch (error) {
            console.error("Failed to start recording:", error);
            toast.error("Failed to start recording");
        }
    };

    // Stop recording
    const stopRecording = async () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Stop all tracks
            if (mediaStreamRef.current) {
                mediaStreamRef.current
                    .getTracks()
                    .forEach((track) => track.stop());
            }

            toast.info("Processing recording and generating transcript...");
        }
    };

    // Process the recorded audio and generate transcript
    const processRecording = async () => {
        setIsProcessing(true);

        try {
            // Create blob from recorded chunks
            const audioBlob = new Blob(audioChunksRef.current, {
                type: "audio/webm",
            });

            // Create FormData to send to API
            const formData = new FormData();
            formData.append(
                "audio",
                audioBlob,
                `meeting-${meetingId}-${Date.now()}.webm`
            );
            formData.append("meetingId", meetingId);
            formData.append("meetingTitle", meetingTitle);

            // Send to API for processing
            const response = await fetch("/api/meetings/process-recording", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to process recording");
            }

            const result = await response.json();

            // Update meeting status to COMPLETED
            await fetch(`/api/meetings/${meetingId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "COMPLETED" }),
            });

            toast.success(
                "Recording processed! Transcript and summary generated."
            );

            // Notify parent component
            if (onRecordingComplete) {
                onRecordingComplete(result);
            }
        } catch (error) {
            console.error("Failed to process recording:", error);
            toast.error("Failed to process recording. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Format duration
    const formatDuration = (start) => {
        if (!start) return "00:00";
        const duration = new Date() - start;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current
                    .getTracks()
                    .forEach((track) => track.stop());
            }
        };
    }, []);

    if (!isSupported) {
        return (
            <Card className="w-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                        Recording Not Supported
                    </h3>
                    <p className="text-muted-foreground text-center">
                        Please use Chrome, Firefox, or Safari to enable meeting
                        recording.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Mic className="w-5 h-5" />
                        Meeting Recording
                        {isRecording && (
                            <Badge
                                variant="destructive"
                                className="animate-pulse"
                            >
                                RECORDING
                            </Badge>
                        )}
                        {isProcessing && (
                            <Badge
                                variant="secondary"
                                className="flex items-center gap-1"
                            >
                                <Loader2 className="w-3 h-3 animate-spin" />
                                PROCESSING
                            </Badge>
                        )}
                    </CardTitle>
                    {isRecording && startTime && (
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                        >
                            <Clock className="w-3 h-3" />
                            {formatDuration(startTime)}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="text-center space-y-4">
                    {!isRecording && !isProcessing ? (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Start recording to capture the meeting audio.
                                The transcript and AI summary will be generated
                                automatically when you end the recording.
                            </p>
                            <Button
                                onClick={startRecording}
                                size="lg"
                                className="flex items-center gap-2"
                            >
                                <Mic className="w-4 h-4" />
                                Start Meeting Recording
                            </Button>
                        </div>
                    ) : isRecording ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-center gap-2 text-red-600">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="font-medium">
                                    Recording in progress...
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Meeting audio is being recorded. Click stop when
                                the meeting ends to generate the transcript and
                                AI summary.
                            </p>
                            <Button
                                onClick={stopRecording}
                                variant="destructive"
                                size="lg"
                                className="flex items-center gap-2"
                            >
                                <MicOff className="w-4 h-4" />
                                Stop Recording & Generate Transcript
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-center gap-2 text-blue-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="font-medium">
                                    Processing recording...
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Generating transcript and AI summary. This may
                                take a few minutes depending on the recording
                                length.
                            </p>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                        📝 How it works:
                    </h4>
                    <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-300">
                        <li>
                            • Audio is recorded in the background during your
                            meeting
                        </li>
                        <li>
                            • When you stop recording, AI generates a full
                            transcript
                        </li>
                        <li>
                            • Gemini AI creates meeting summary, highlights, and
                            action items
                        </li>
                        <li>
                            • Everything is saved automatically to your meeting
                            history
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
