"use client";

import {
    Excalidraw,
    convertToExcalidrawElements,
} from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Save, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function ExcalidrawWrapper({
    organizationId,
    projectId = null,
    canvasId = null,
    readOnly = false,
    title = "Team Canvas",
}) {
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);
    const [elements, setElements] = useState([]);
    const [appState, setAppState] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [collaborators, setCollaborators] = useState([]);

    // Auto-save interval (every 30 seconds)
    useEffect(() => {
        if (!readOnly && elements.length > 0) {
            const autoSaveInterval = setInterval(() => {
                handleSave();
            }, 30000);

            return () => clearInterval(autoSaveInterval);
        }
    }, [elements, readOnly]);

    // Load canvas data on component mount
    useEffect(() => {
        loadCanvasData();
    }, [canvasId, organizationId, projectId]);

    const loadCanvasData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(
                `/api/canvas?${new URLSearchParams({
                    organizationId,
                    ...(projectId && { projectId }),
                    ...(canvasId && { canvasId }),
                })}`
            );

            if (response.ok) {
                const data = await response.json();
                if (data.elements) {
                    setElements(data.elements);
                }
                if (data.appState) {
                    setAppState(data.appState);
                }
                setLastSaved(data.updatedAt ? new Date(data.updatedAt) : null);
                setCollaborators(data.collaborators || []);
            }
        } catch (error) {
            console.error("Error loading canvas:", error);
            toast.error("Failed to load canvas data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = useCallback(async () => {
        if (readOnly || isSaving || elements.length === 0) return;

        try {
            setIsSaving(true);
            const response = await fetch("/api/canvas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    organizationId,
                    projectId,
                    canvasId,
                    elements,
                    appState,
                    title,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setLastSaved(new Date());
                toast.success("Canvas saved successfully!");
            } else {
                throw new Error("Failed to save canvas");
            }
        } catch (error) {
            console.error("Error saving canvas:", error);
            toast.error("Failed to save canvas");
        } finally {
            setIsSaving(false);
        }
    }, [
        organizationId,
        projectId,
        canvasId,
        elements,
        appState,
        readOnly,
        isSaving,
        title,
    ]);

    const handleChange = (newElements, newAppState) => {
        setElements(newElements);
        setAppState(newAppState);
    };

    if (isLoading) {
        return (
            <div className="w-full h-[600px] flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p>Loading canvas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            {/* Canvas Header */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CardTitle className="flex items-center gap-2">
                                {title}
                            </CardTitle>
                            <Badge variant="outline">
                                {readOnly ? "View Only" : "Collaborative"}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-3">
                            {collaborators.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span className="text-sm text-muted-foreground">
                                        {collaborators.length} online
                                    </span>
                                </div>
                            )}

                            {lastSaved && (
                                <span className="text-xs text-muted-foreground">
                                    Last saved: {lastSaved.toLocaleTimeString()}
                                </span>
                            )}

                            {!readOnly && (
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    size="sm"
                                    variant="outline"
                                >
                                    {isSaving ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {isSaving ? "Saving..." : "Save"}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Excalidraw Canvas */}
            <Card>
                <CardContent className="p-0">
                    <div className="w-full h-[600px]">
                        <Excalidraw
                            ref={(api) => setExcalidrawAPI(api)}
                            initialData={{
                                elements,
                                appState: {
                                    ...appState,
                                    viewModeEnabled: readOnly,
                                },
                            }}
                            onChange={handleChange}
                            UIOptions={{
                                canvasActions: {
                                    loadScene: false,
                                },
                            }}
                            theme="light"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Canvas Instructions */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                            <h4 className="font-medium text-foreground mb-2">
                                Canvas Features:
                            </h4>
                            <ul className="space-y-1">
                                <li>
                                    • Draw shapes, arrows, and freehand sketches
                                </li>
                                <li>• Add text annotations and labels</li>
                                <li>• Insert images and diagrams</li>
                                <li>
                                    • Real-time collaboration with team members
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-foreground mb-2">
                                Keyboard Shortcuts:
                            </h4>
                            <ul className="space-y-1">
                                <li>
                                    • <kbd>Ctrl/Cmd + Z</kbd> - Undo
                                </li>
                                <li>
                                    • <kbd>Ctrl/Cmd + Y</kbd> - Redo
                                </li>
                                <li>
                                    • <kbd>Ctrl/Cmd + S</kbd> - Save canvas
                                </li>
                                <li>
                                    • <kbd>Space + Drag</kbd> - Pan canvas
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
