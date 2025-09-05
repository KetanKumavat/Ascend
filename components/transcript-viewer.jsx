"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  FileTextIcon,
  SparklesIcon,
  DownloadIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function TranscriptViewer({ meetingId, meeting }) {
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  useEffect(() => {
    fetchTranscript();
  }, [meetingId]);

  const fetchTranscript = async () => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/transcript`);
      if (!response.ok) {
        if (response.status === 404) {
          setTranscript(null);
          return;
        }
        throw new Error("Failed to fetch transcript");
      }
      
      const data = await response.json();
      setTranscript(data);
    } catch (error) {
      console.error("Error fetching transcript:", error);
      toast.error("Failed to load transcript");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDownloadTranscript = () => {
    const content = transcript.content;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meeting.title}-transcript-${format(new Date(meeting.scheduledAt), "yyyy-MM-dd")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Transcript downloaded!");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!transcript) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileTextIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No transcript available</h3>
          <p className="text-muted-foreground text-center">
            The transcript for this meeting is not yet available. It will be generated automatically after the meeting ends.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatHighlights = (highlights) => {
    // Split by numbered points and format
    const sections = highlights.split(/(\d+\.\s)/).filter(Boolean);
    const formattedSections = [];
    
    for (let i = 0; i < sections.length; i += 2) {
      if (sections[i] && sections[i + 1]) {
        formattedSections.push({
          number: sections[i].trim(),
          content: sections[i + 1].trim(),
        });
      }
    }
    
    return formattedSections;
  };

  const highlightSections = transcript.highlights ? formatHighlights(transcript.highlights) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileTextIcon className="w-5 h-5" />
            Meeting Transcript
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generated on {format(new Date(transcript.createdAt), "PPP 'at' p")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopyToClipboard(transcript.content)}
          >
            <CopyIcon className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTranscript}
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Tabs defaultValue="highlights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="highlights" className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4" />
            AI Highlights
          </TabsTrigger>
          <TabsTrigger value="full" className="flex items-center gap-2">
            <FileTextIcon className="w-4 h-4" />
            Full Transcript
          </TabsTrigger>
        </TabsList>

        <TabsContent value="highlights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-purple-600" />
                AI-Generated Summary
                <Badge variant="secondary" className="ml-2">
                  Beta
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transcript.highlights ? (
                <div className="space-y-4">
                  {highlightSections.length > 0 ? (
                    highlightSections.map((section, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5">
                            {section.number}
                          </Badge>
                          <p className="text-sm leading-relaxed">{section.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{transcript.highlights}</p>
                    </div>
                  )}
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <SparklesIcon className="w-3 h-3" />
                      This summary was generated by AI and may not capture all details. 
                      Review the full transcript for complete information.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <SparklesIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    AI highlights are being generated...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="full" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileTextIcon className="w-5 h-5" />
                  Complete Transcript
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFullTranscript(!showFullTranscript)}
                >
                  {showFullTranscript ? (
                    <>
                      <EyeOffIcon className="w-4 h-4 mr-2" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <EyeIcon className="w-4 h-4 mr-2" />
                      Expand
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className={`prose prose-sm max-w-none ${
                  showFullTranscript ? "max-h-none" : "max-h-96 overflow-hidden"
                }`}
              >
                <div className="whitespace-pre-wrap font-mono text-sm bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border">
                  {transcript.content}
                </div>
              </div>
              
              {!showFullTranscript && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-neutral-950 to-transparent pointer-events-none" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
