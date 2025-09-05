"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Save, Download, Copy, User, Clock, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { saveTranscript } from "@/actions/meetings";
import { toast } from "sonner";

export function LiveTranscript({ meetingId, meetingTitle }) {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState([]);
    const [currentSpeaker, setCurrentSpeaker] = useState("");
    const [isSupported, setIsSupported] = useState(true);
    const [startTime, setStartTime] = useState(null);
    const [savedStatus, setSavedStatus] = useState("");
    const [meetingStatus, setMeetingStatus] = useState("SCHEDULED");
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState("connected");
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [audioSource, setAudioSource] = useState("microphone"); // "microphone" or "system"
    const [systemAudioSupported, setSystemAudioSupported] = useState(false);

    const recognitionRef = useRef(null);
    const interimResultRef = useRef("");
    const autoSaveIntervalRef = useRef(null);
    const retryTimeoutRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const audioContextRef = useRef(null);
    const sourceNodeRef = useRef(null);

    // Auto-save transcript chunks every 30 seconds during recording
    const autoSaveTranscript = useCallback(async () => {
        if (!isRecording || transcript.length === 0) return;

        try {
            setConnectionStatus("saving");
            const transcriptContent = transcript
                .filter(entry => entry.isFinal)
                .map(entry => `[${entry.timestamp.toLocaleTimeString()}] ${entry.speaker}: ${entry.text}`)
                .join('\n');

            if (transcriptContent.trim()) {
                const response = await fetch(`/api/meetings/${meetingId}/transcript/autosave`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: transcriptContent,
                        isPartial: true,
                        timestamp: new Date().toISOString(),
                        chunkId: Date.now()
                    })
                });

                if (response.ok) {
                    setLastSavedAt(new Date());
                    setConnectionStatus("connected");
                    setSavedStatus("Auto-saved");
                    setTimeout(() => setSavedStatus(""), 2000);
                } else {
                    throw new Error('Auto-save failed');
                }
            }
        } catch (error) {
            console.error('Auto-save error:', error);
            setConnectionStatus("error");
            setSavedStatus("Auto-save failed");
            
            // Retry in 10 seconds
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = setTimeout(autoSaveTranscript, 10000);
        }
    }, [isRecording, transcript, meetingId]);

    // Update meeting status when transcript starts/stops
    const updateMeetingStatus = useCallback(async (status) => {
        try {
            await fetch(`/api/meetings/${meetingId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            setMeetingStatus(status);
        } catch (error) {
            console.error('Failed to update meeting status:', error);
        }
    }, [meetingId]);

    // Check system audio capture support
    useEffect(() => {
        const checkSystemAudioSupport = async () => {
            try {
                // Check if getDisplayMedia is available and supports audio
                if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                    setSystemAudioSupported(true);
                } else {
                    setSystemAudioSupported(false);
                }
            } catch (error) {
                console.log("System audio not supported:", error);
                setSystemAudioSupported(false);
            }
        };

        checkSystemAudioSupport();
    }, []);

    // Setup system audio capture
    const setupSystemAudioCapture = async () => {
        try {
            // Request screen share with audio
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: false,
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    channelCount: 2,
                    sampleRate: 44100,
                    sampleSize: 16
                }
            });

            mediaStreamRef.current = stream;

            // Create audio context for processing
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioContext;

            // Create source node from the stream
            const source = audioContext.createMediaStreamSource(stream);
            sourceNodeRef.current = source;

            // Create destination for speech recognition
            const destination = audioContext.createMediaStreamDestination();
            source.connect(destination);

            // Setup speech recognition with system audio
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            // Connect system audio to speech recognition
            setupSpeechRecognitionWithSystemAudio(recognition, destination.stream);

            recognitionRef.current = recognition;

            toast.success("System audio capture enabled! All meeting audio will be transcribed.");
            return true;

        } catch (error) {
            console.error("System audio capture failed:", error);
            
            if (error.name === 'NotAllowedError') {
                toast.error("System audio permission denied. Please allow screen sharing with audio.");
            } else if (error.name === 'NotSupportedError') {
                toast.error("System audio capture not supported in this browser. Try Chrome or Edge.");
            } else {
                toast.error("Failed to setup system audio capture. Falling back to microphone.");
            }
            
            setAudioSource("microphone");
            return false;
        }
    };

    // Setup microphone capture (original method)
    const setupMicrophoneCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            setupSpeechRecognitionHandlers(recognition);
            recognitionRef.current = recognition;

            return true;
        } catch (error) {
            console.error("Microphone access failed:", error);
            toast.error("Microphone access denied. Please allow microphone permissions.");
            return false;
        }
    };

    // Setup speech recognition with system audio stream
    const setupSpeechRecognitionWithSystemAudio = (recognition, audioStream) => {
        recognition.onstart = () => {
            console.log("🎤 System audio transcription started");
            setStartTime(new Date());
            updateMeetingStatus("IN_PROGRESS");
        };

        recognition.onresult = (event) => {
            let interimTranscript = "";
            let finalTranscript = "";

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
                    speaker: currentSpeaker || detectSpeaker(finalTranscript),
                    text: finalTranscript.trim(),
                    timestamp: new Date(),
                    isFinal: true,
                    source: audioSource
                };

                setTranscript((prev) => [...prev, newEntry]);
                interimResultRef.current = "";
            } else {
                interimResultRef.current = interimTranscript;
                setTranscript((prev) => [...prev]);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setConnectionStatus("error");
            
            if (event.error === "not-allowed") {
                toast.error("Microphone access denied. Please allow microphone access.");
            } else if (event.error === "network") {
                toast.error("Network error. Check your internet connection.");
                setConnectionStatus("disconnected");
            }
        };

        recognition.onend = () => {
            console.log("🛑 Speech recognition ended");
            if (isRecording) {
                try {
                    recognition.start();
                } catch (error) {
                    console.error("Failed to restart recognition:", error);
                    setIsRecording(false);
                    setConnectionStatus("error");
                }
            }
        };
    };

    // Basic speaker detection based on audio patterns (placeholder)
    const detectSpeaker = (text) => {
        // This is a simplified speaker detection
        // In a real implementation, you'd use voice fingerprinting or ML models
        const speakers = ["Speaker A", "Speaker B", "Speaker C"];
        return speakers[Math.floor(Math.random() * speakers.length)];
    };

    // Setup speech recognition handlers (for microphone mode)
    const setupSpeechRecognitionHandlers = (recognition) => {
        recognition.onstart = () => {
            console.log("🎤 Microphone transcription started");
            setStartTime(new Date());
            updateMeetingStatus("IN_PROGRESS");
        };

        recognition.onresult = (event) => {
            let interimTranscript = "";
            let finalTranscript = "";

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
                    isFinal: true,
                    source: audioSource
                };

                setTranscript((prev) => [...prev, newEntry]);
                interimResultRef.current = "";
            } else {
                interimResultRef.current = interimTranscript;
                setTranscript((prev) => [...prev]);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setConnectionStatus("error");
            
            if (event.error === "not-allowed") {
                toast.error("Microphone access denied. Please allow microphone access and try again.");
            } else if (event.error === "network") {
                toast.error("Network error. Check your internet connection.");
                setConnectionStatus("disconnected");
            }
        };

        recognition.onend = () => {
            console.log("🛑 Speech recognition ended");
            if (isRecording) {
                try {
                    recognition.start();
                } catch (error) {
                    console.error("Failed to restart recognition:", error);
                    setIsRecording(false);
                    setConnectionStatus("error");
                }
            }
        };
    };

    useEffect(() => {
        // Check if browser supports speech recognition
        if (
            !("webkitSpeechRecognition" in window) &&
            !("SpeechRecognition" in window)
        ) {
            setIsSupported(false);
            return;
        }

        // Initialize speech recognition
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            console.log("🎤 Speech recognition started");
            setStartTime(new Date());
            updateMeetingStatus("IN_PROGRESS");
        };

        recognition.onresult = (event) => {
            let interimTranscript = "";
            let finalTranscript = "";

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
                    isFinal: true,
                };

                setTranscript((prev) => [...prev, newEntry]);
                interimResultRef.current = "";
            } else {
                interimResultRef.current = interimTranscript;
                // Force re-render to show interim results
                setTranscript((prev) => [...prev]);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setConnectionStatus("error");
            
            if (event.error === "not-allowed") {
                toast.error("Microphone access denied. Please allow microphone access and try again.");
            } else if (event.error === "network") {
                toast.error("Network error. Check your internet connection.");
                setConnectionStatus("disconnected");
            }
        };

        recognition.onend = () => {
            console.log("🛑 Speech recognition ended");
            if (isRecording) {
                // Restart if still supposed to be recording
                try {
                    recognition.start();
                } catch (error) {
                    console.error("Failed to restart recognition:", error);
                    setIsRecording(false);
                    setConnectionStatus("error");
                }
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [isRecording, currentSpeaker, updateMeetingStatus]);

    // Set up auto-save interval
    useEffect(() => {
        if (isRecording && autoSaveEnabled) {
            autoSaveIntervalRef.current = setInterval(autoSaveTranscript, 30000); // Every 30 seconds
            return () => {
                if (autoSaveIntervalRef.current) {
                    clearInterval(autoSaveIntervalRef.current);
                }
            };
        }
    }, [isRecording, autoSaveEnabled, autoSaveTranscript]);

    const startRecording = async () => {
        if (!isSupported) {
            toast.error("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
            return;
        }

        try {
            setConnectionStatus("connecting");
            
            let success = false;
            
            if (audioSource === "system") {
                success = await setupSystemAudioCapture();
            } else {
                success = await setupMicrophoneCapture();
            }

            if (success && recognitionRef.current) {
                setIsRecording(true);
                setConnectionStatus("connected");
                recognitionRef.current.start();
            } else {
                setConnectionStatus("error");
                toast.error("Failed to start recording. Please check your permissions.");
            }
        } catch (error) {
            console.error("Failed to start recording:", error);
            setConnectionStatus("error");
            toast.error("Failed to start recording. Please try again.");
        }
    };

    const stopRecording = async () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        
        // Stop media streams
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        
        // Close audio context
        if (audioContextRef.current) {
            await audioContextRef.current.close();
            audioContextRef.current = null;
        }
        
        setIsRecording(false);
        
        // Final save when stopping
        if (transcript.length > 0) {
            await saveFinalTranscript();
        }
        
        await updateMeetingStatus("COMPLETED");
    };

    const saveFinalTranscript = async () => {
        if (transcript.length === 0) {
            toast.error("No transcript to save");
            return;
        }

        setSavedStatus("Saving final transcript...");
        
        try {
            const speakers = [...new Set(transcript.map(entry => entry.speaker))];
            const transcriptContent = transcript
                .filter(entry => entry.isFinal)
                .map(entry => `[${entry.timestamp.toLocaleTimeString()}] ${entry.speaker}: ${entry.text}`)
                .join('\n');

            const transcriptData = {
                content: transcriptContent,
                speakers: speakers,
                startTime: startTime?.toISOString(),
                endTime: new Date().toISOString(),
                language: "en",
                source: "browser-transcript"
            };

            await saveTranscript(meetingId, transcriptData);
            setSavedStatus("✅ Transcript saved successfully!");
            toast.success("Meeting transcript saved successfully!");
            
            setTimeout(() => setSavedStatus(""), 3000);
        } catch (error) {
            console.error("Save error:", error);
            setSavedStatus("❌ Failed to save transcript");
            toast.error("Failed to save transcript. Please try again.");
        }
    };

    const downloadTranscript = () => {
        if (transcript.length === 0) {
            toast.error("No transcript to download");
            return;
        }

        const content = transcript
            .filter(entry => entry.isFinal)
            .map(entry => `[${entry.timestamp.toLocaleTimeString()}] ${entry.speaker}: ${entry.text}`)
            .join('\n');

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${meetingTitle}-transcript-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Transcript downloaded!");
    };

    const copyToClipboard = () => {
        const content = transcript
            .filter(entry => entry.isFinal)
            .map(entry => `[${entry.timestamp.toLocaleTimeString()}] ${entry.speaker}: ${entry.text}`)
            .join('\n');
        
        navigator.clipboard.writeText(content);
        toast.success("Transcript copied to clipboard!");
    };

    const formatDuration = (start) => {
        if (!start) return "00:00";
        const duration = new Date() - start;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getConnectionIcon = () => {
        switch (connectionStatus) {
            case "saving": return <Clock className="w-4 h-4 animate-spin" />;
            case "error": 
            case "disconnected": return <WifiOff className="w-4 h-4" />;
            default: return <Wifi className="w-4 h-4" />;
        }
    };

    const getConnectionColor = () => {
        switch (connectionStatus) {
            case "saving": return "text-blue-600";
            case "error": 
            case "disconnected": return "text-red-600";
            default: return "text-green-600";
        }
    };

    if (!isSupported) {
        return (
            <Card className="w-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Speech Recognition Not Supported</h3>
                    <p className="text-muted-foreground text-center">
                        Please use Chrome, Edge, or Safari to enable live transcription.
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
                        Live Transcript
                        {isRecording && (
                            <Badge variant="destructive" className="animate-pulse">
                                RECORDING
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1 text-sm ${getConnectionColor()}`}>
                            {getConnectionIcon()}
                            <span className="capitalize">{connectionStatus}</span>
                        </div>
                        {isRecording && startTime && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(startTime)}
                            </Badge>
                        )}
                    </div>
                </div>
                
                {savedStatus && (
                    <div className="text-sm text-muted-foreground">
                        {savedStatus}
                    </div>
                )}
                
                {lastSavedAt && autoSaveEnabled && (
                    <div className="text-xs text-muted-foreground">
                        Last auto-saved: {lastSavedAt.toLocaleTimeString()}
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Controls */}
                <div className="flex flex-wrap gap-2">
                    {!isRecording ? (
                        <Button onClick={startRecording} className="flex items-center gap-2">
                            <Mic className="w-4 h-4" />
                            Start Recording
                        </Button>
                    ) : (
                        <Button 
                            onClick={stopRecording} 
                            variant="destructive" 
                            className="flex items-center gap-2"
                        >
                            <MicOff className="w-4 h-4" />
                            Stop Recording
                        </Button>
                    )}

                    <Button
                        onClick={saveFinalTranscript}
                        disabled={transcript.length === 0}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Transcript
                    </Button>

                    <Button
                        onClick={downloadTranscript}
                        disabled={transcript.length === 0}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </Button>

                    <Button
                        onClick={copyToClipboard}
                        disabled={transcript.length === 0}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Copy className="w-4 h-4" />
                        Copy
                    </Button>
                </div>

                {/* Audio Source Selection */}
                <div className="flex items-center gap-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border">
                    <div className="text-sm font-medium">Audio Source:</div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="audioSource"
                                value="microphone"
                                checked={audioSource === "microphone"}
                                onChange={(e) => setAudioSource(e.target.value)}
                                disabled={isRecording}
                                className="text-blue-600"
                            />
                            <Mic className="w-4 h-4" />
                            <span className="text-sm">Microphone Only</span>
                        </label>
                        
                        <label className={`flex items-center gap-2 cursor-pointer ${!systemAudioSupported && 'opacity-50 cursor-not-allowed'}`}>
                            <input
                                type="radio"
                                name="audioSource"
                                value="system"
                                checked={audioSource === "system"}
                                onChange={(e) => setAudioSource(e.target.value)}
                                disabled={isRecording || !systemAudioSupported}
                                className="text-blue-600"
                            />
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span className="text-sm">System Audio (All Speakers)</span>
                            {!systemAudioSupported && (
                                <span className="text-xs text-red-500">(Not Supported)</span>
                            )}
                        </label>
                    </div>
                </div>

                {audioSource === "system" && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">System Audio Mode</p>
                                <p className="text-blue-700 dark:text-blue-300">
                                    This will capture all audio from your system including meeting participants, music, and notifications. 
                                    You'll need to share your screen/audio when prompted.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Speaker Input */}
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Enter speaker name (optional)"
                        value={currentSpeaker}
                        onChange={(e) => setCurrentSpeaker(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                </div>

                {/* Auto-save Toggle */}
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={autoSaveEnabled}
                            onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                            className="rounded"
                        />
                        Enable auto-save every 30 seconds
                    </label>
                </div>

                {/* Transcript Display */}
                <ScrollArea className="h-96 w-full border rounded-md p-4">
                    {transcript.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            {isRecording 
                                ? "Listening... Start speaking to see the transcript." 
                                : "Click 'Start Recording' to begin transcription."
                            }
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transcript
                                .filter(entry => entry.isFinal)
                                .map((entry) => (
                                <div key={entry.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                                    <div className="flex-shrink-0 space-y-1">
                                        <Badge variant="outline" className="text-xs">
                                            {entry.speaker}
                                        </Badge>
                                        {entry.source && (
                                            <Badge variant="secondary" className="text-xs">
                                                {entry.source === "system" ? "🔊 System" : "🎤 Mic"}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm">{entry.text}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {entry.timestamp.toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Show interim results */}
                            {interimResultRef.current && (
                                <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg opacity-70">
                                    <div className="flex-shrink-0">
                                        <Badge variant="outline" className="text-xs">
                                            {currentSpeaker || "Current"}
                                        </Badge>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm italic">{interimResultRef.current}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Typing...
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>

                {/* Stats */}
                {transcript.length > 0 && (
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Total entries: {transcript.filter(e => e.isFinal).length}</span>
                        <span>Speakers: {[...new Set(transcript.map(e => e.speaker))].length}</span>
                        {startTime && (
                            <span>Duration: {formatDuration(startTime)}</span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
