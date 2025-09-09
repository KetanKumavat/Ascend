"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    FileText,
    Clock,
    Users,
    Download,
    Copy,
    Sparkles,
    CheckSquare,
    Lightbulb,
} from "lucide-react";
import { toast } from "sonner";

export function TranscriptDisplay({ meetingId, className = "" }) {
    const [transcript, setTranscript] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTranscript();
    }, [meetingId]);

    const fetchTranscript = async () => {
        try {
            const response = await fetch(
                `/api/meetings/${meetingId}/transcript`
            );
            if (response.ok) {
                const data = await response.json();
                setTranscript(data);
            } else {
                console.error("Failed to fetch transcript:", response.status);
                setTranscript(null);
            }
        } catch (error) {
            console.error("Error fetching transcript:", error);
            setTranscript(null);
        } finally {
            setLoading(false);
        }
    };

    const downloadTranscript = () => {
        if (!transcript) return;

        try {
            const getSpeakers = () => {
                try {
                    return Array.isArray(transcript.speakers)
                        ? transcript.speakers
                        : transcript.speakers
                        ? JSON.parse(transcript.speakers)
                        : [];
                } catch (e) {
                    return [];
                }
            };

            const getHighlights = () => {
                try {
                    return Array.isArray(transcript.highlights)
                        ? transcript.highlights
                        : transcript.highlights
                        ? JSON.parse(transcript.highlights)
                        : [];
                } catch (e) {
                    return [];
                }
            };

            const getActionItems = () => {
                try {
                    return Array.isArray(transcript.actionItems)
                        ? transcript.actionItems
                        : transcript.actionItems
                        ? JSON.parse(transcript.actionItems)
                        : [];
                } catch (e) {
                    return [];
                }
            };

            const speakers = getSpeakers();
            const highlights = getHighlights();
            const actionItems = getActionItems();

            const content = `Meeting Transcript
================
Meeting ID: ${meetingId}
Date: ${new Date(transcript.createdAt).toLocaleString()}
Duration: ${transcript.duration || 0} minutes
Speakers: ${speakers.length > 0 ? speakers.join(", ") : "Unknown"}

Summary:
${transcript.summary || "No summary available"}

Highlights:
${
    highlights.length > 0
        ? highlights.map((h) => `• ${h}`).join("\n")
        : "No highlights available"
}

Action Items:
${
    actionItems.length > 0
        ? actionItems.map((a) => `• ${a}`).join("\n")
        : "No action items available"
}

Full Transcript:
================
${transcript.content}`;

            const blob = new Blob([content], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `meeting-transcript-${meetingId}-${
                new Date().toISOString().split("T")[0]
            }.txt`;

            // Safer DOM manipulation
            if (document.body) {
                document.body.appendChild(a);
                a.click();
                if (document.body.contains(a)) {
                    document.body.removeChild(a);
                }
            }
            URL.revokeObjectURL(url);
            toast.success("Transcript downloaded!");
        } catch (error) {
            console.error("Error downloading transcript:", error);
            toast.error("Failed to download transcript");
        }
    };

    const copyToClipboard = () => {
        if (!transcript) return;

        try {
            navigator.clipboard.writeText(transcript.content);
            toast.success("Transcript copied to clipboard!");
        } catch (error) {
            console.error("Error copying to clipboard:", error);
            toast.error("Failed to copy transcript");
        }
    };

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p>Loading transcript...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!transcript) {
        return (
            <Card className={className}>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                        No Transcript Available
                    </h3>
                    <p className="text-muted-foreground">
                        This meeting hasn&apos;t been recorded yet or the
                        transcript is still being processed.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Safely parse arrays with proper error handling
    const getSafeArray = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.warn("Failed to parse array data:", e);
            return [];
        }
    };

    const highlights = getSafeArray(transcript.highlights);
    const actionItems = getSafeArray(transcript.actionItems);
    const speakers = getSafeArray(transcript.speakers);

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Summary Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-500" />
                            AI-Generated Summary
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                onClick={copyToClipboard}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                            >
                                <Copy className="w-3 h-3" />
                                Copy
                            </Button>
                            <Button
                                onClick={downloadTranscript}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                            >
                                <Download className="w-3 h-3" />
                                Download
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Meeting Stats */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{transcript.duration || 0} minutes</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>
                                {speakers && speakers.length > 0
                                    ? speakers.length
                                    : 0}{" "}
                                speaker
                                {!speakers || speakers.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>
                                {new Date(
                                    transcript.createdAt
                                ).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {/* Summary */}
                    {transcript.summary && (
                        <div>
                            <h4 className="font-semibold mb-2">
                                Meeting Summary
                            </h4>
                            <p className="text-sm leading-relaxed">
                                {transcript.summary}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Highlights and Action Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Highlights */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            Key Highlights
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {highlights && highlights.length > 0 ? (
                            <ul className="space-y-2">
                                {highlights.map((highlight, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-2 text-sm"
                                    >
                                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <span>{highlight}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No highlights identified
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Action Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CheckSquare className="w-4 h-4 text-green-500" />
                            Action Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {actionItems && actionItems.length > 0 ? (
                            <ul className="space-y-2">
                                {actionItems.map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-2 text-sm"
                                    >
                                        <CheckSquare className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No action items identified
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Full Transcript */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Full Transcript
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="formatted" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="formatted">
                                Formatted
                            </TabsTrigger>
                            <TabsTrigger value="raw">Raw Text</TabsTrigger>
                        </TabsList>

                        <TabsContent value="formatted" className="mt-4">
                            <ScrollArea className="h-96 w-full border rounded-md p-4">
                                <div className="space-y-3">
                                    {transcript.content &&
                                        transcript.content
                                            .split("\n")
                                            .map((line, index) => {
                                                if (!line || !line.trim())
                                                    return null;

                                                // Parse transcript lines that look like "[timestamp] Speaker: text"
                                                const match = line.match(
                                                    /^\[([^\]]+)\]\s*([^:]+):\s*(.+)$/
                                                );
                                                if (match) {
                                                    const [
                                                        ,
                                                        timestamp,
                                                        speaker,
                                                        text,
                                                    ] = match;
                                                    return (
                                                        <div
                                                            key={index}
                                                            className="flex gap-3 p-3 bg-muted rounded-lg"
                                                        >
                                                            <div className="flex-shrink-0 space-y-1">
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {speaker
                                                                        ? speaker.trim()
                                                                        : "Unknown"}
                                                                </Badge>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {timestamp ||
                                                                        ""}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm leading-relaxed">
                                                                    {text || ""}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <div
                                                            key={index}
                                                            className="text-sm p-2"
                                                        >
                                                            {line}
                                                        </div>
                                                    );
                                                }
                                            })}
                                    {(!transcript.content ||
                                        transcript.content.trim() === "") && (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No transcript content available
                                        </p>
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="raw" className="mt-4">
                            <ScrollArea className="h-96 w-full border rounded-md p-4">
                                <pre className="text-sm whitespace-pre-wrap font-mono">
                                    {transcript.content ||
                                        "No transcript content available"}
                                </pre>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
