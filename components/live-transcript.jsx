"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Mic, 
    MicOff, 
    Save, 
    Download, 
    Copy,
    User,
    Clock
} from "lucide-react";
import { saveTranscript } from "@/actions/jitsi-meetings";

export function LiveTranscript({ meetingId, meetingTitle }) {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState([]);
    const [currentSpeaker, setCurrentSpeaker] = useState("");
    const [isSupported, setIsSupported] = useState(true);
    const [startTime, setStartTime] = useState(null);
    const [savedStatus, setSavedStatus] = useState("");
    
    const recognitionRef = useRef(null);
    const interimResultRef = useRef("");

    useEffect(() => {
        // Check if browser supports speech recognition
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsSupported(false);
            return;
        }

        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            console.log("🎤 Speech recognition started");
            setStartTime(new Date());
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript;

                if (result.isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                const newEntry = {
                    id: Date.now(),
                    speaker: currentSpeaker || `Speaker ${transcript.length + 1}`,
                    text: finalTranscript.trim(),
                    timestamp: new Date(),
                    isFinal: true
                };

                setTranscript(prev => [...prev, newEntry]);
                interimResultRef.current = '';
            } else {
                interimResultRef.current = interimTranscript;
                // Force re-render to show interim results
                setTranscript(prev => [...prev]);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === 'not-allowed') {
                alert('Microphone access denied. Please allow microphone access and try again.');
            }
        };

        recognition.onend = () => {
            console.log("🛑 Speech recognition ended");
            if (isRecording) {
                // Restart if still supposed to be recording
                recognition.start();
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [isRecording, currentSpeaker, transcript.length]);

    const startRecording = () => {
        if (!isSupported) {
            alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
            return;
        }

        if (recognitionRef.current) {
            setIsRecording(true);
            recognitionRef.current.start();
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            setIsRecording(false);
            recognitionRef.current.stop();
        }
    };

    const saveTranscriptToDatabase = async () => {
        if (!transcript.length) {
            alert('No transcript to save');
            return;
        }

        try {
            setSavedStatus("Saving...");
            
            const transcriptContent = transcript
                .map(entry => `[${entry.timestamp.toLocaleTimeString()}] ${entry.speaker}: ${entry.text}`)
                .join('\n');

            const transcriptData = {
                content: transcriptContent,
                speakers: [...new Set(transcript.map(entry => entry.speaker))],
                startTime: startTime || new Date(),
                endTime: new Date(),
                language: 'en',
                rawData: transcript
            };

            await saveTranscript(meetingId, transcriptData);
            setSavedStatus("✅ Saved successfully!");
            
            setTimeout(() => setSavedStatus(""), 3000);
        } catch (error) {
            console.error('Failed to save transcript:', error);
            setSavedStatus("❌ Save failed");
            setTimeout(() => setSavedStatus(""), 3000);
        }
    };

    const downloadTranscript = () => {
        if (!transcript.length) return;

        const content = transcript
            .map(entry => `[${entry.timestamp.toLocaleTimeString()}] ${entry.speaker}: ${entry.text}`)
            .join('\n');

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${meetingTitle}-transcript-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyTranscript = () => {
        if (!transcript.length) return;

        const content = transcript
            .map(entry => `[${entry.timestamp.toLocaleTimeString()}] ${entry.speaker}: ${entry.text}`)
            .join('\n');

        navigator.clipboard.writeText(content);
        alert('Transcript copied to clipboard!');
    };

    if (!isSupported) {
        return (
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-red-600">
                        Speech Recognition Not Supported
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Your browser doesn't support speech recognition. Please use Chrome or Edge for live transcription.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Mic className="w-5 h-5" />
                        Live Transcript - {meetingTitle}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {isRecording && (
                            <Badge variant="destructive" className="animate-pulse">
                                🔴 Recording
                            </Badge>
                        )}
                        {savedStatus && (
                            <Badge variant="outline">
                                {savedStatus}
                            </Badge>
                        )}
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                    <input
                        type="text"
                        placeholder="Your name (for transcript)"
                        value={currentSpeaker}
                        onChange={(e) => setCurrentSpeaker(e.target.value)}
                        className="px-3 py-1 border rounded text-sm"
                    />
                    
                    <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        variant={isRecording ? "destructive" : "default"}
                        size="sm"
                    >
                        {isRecording ? (
                            <>
                                <MicOff className="w-4 h-4 mr-2" />
                                Stop Recording
                            </>
                        ) : (
                            <>
                                <Mic className="w-4 h-4 mr-2" />
                                Start Recording
                            </>
                        )}
                    </Button>

                    <Button onClick={saveTranscriptToDatabase} size="sm" variant="outline">
                        <Save className="w-4 h-4 mr-2" />
                        Save to DB
                    </Button>

                    <Button onClick={downloadTranscript} size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>

                    <Button onClick={copyTranscript} size="sm" variant="outline">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-96 w-full border rounded p-4">
                    {transcript.length === 0 && !isRecording && (
                        <p className="text-muted-foreground text-center py-8">
                            Click "Start Recording" to begin live transcription
                        </p>
                    )}
                    
                    {transcript.map((entry) => (
                        <div key={entry.id} className="mb-3 p-2 border-l-4 border-blue-500 bg-blue-50">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-blue-700">{entry.speaker}</span>
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                    {entry.timestamp.toLocaleTimeString()}
                                </span>
                            </div>
                            <p className="text-gray-800">{entry.text}</p>
                        </div>
                    ))}
                    
                    {/* Show interim results */}
                    {isRecording && interimResultRef.current && (
                        <div className="mb-3 p-2 border-l-4 border-gray-300 bg-gray-50 opacity-70">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-500">
                                    {currentSpeaker || "Current Speaker"}
                                </span>
                                <Badge variant="outline" className="text-xs">Live</Badge>
                            </div>
                            <p className="text-gray-600 italic">{interimResultRef.current}</p>
                        </div>
                    )}
                </ScrollArea>

                {transcript.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-700">
                            📝 <strong>{transcript.length}</strong> transcript entries captured
                            {startTime && (
                                <span className="ml-2">
                                    • Started: {startTime.toLocaleTimeString()}
                                </span>
                            )}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
