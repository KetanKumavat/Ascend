"use client";

import {
    Excalidraw,
    convertToExcalidrawElements,
} from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Save,
    Users,
    RefreshCw,
    ArrowLeft,
    Home,
    FolderIcon,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ExcalidrawWrapper({
    organizationId,
    projectId = null,
    canvasId = null,
    readOnly = false,
    title = "Team Canvas",
}) {
    const router = useRouter();
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);
    const [elements, setElements] = useState([]);
    const [appState, setAppState] = useState({
        viewModeEnabled: readOnly,
        collaborators: new Map(),
        gridSize: null,
        currentItemFontSize: 20,
        currentItemStrokeColor: "#000000",
        currentItemBackgroundColor: "transparent",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [collaborators, setCollaborators] = useState([]);

    // Ref to prevent infinite loops
    const isUpdatingRef = useRef(false);
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

    // Auto-save interval (every 30 seconds)
    useEffect(() => {
        if (!readOnly && elements.length > 0) {
            const autoSaveInterval = setInterval(() => {
                if (!isSaving) {
                    handleSave();
                }
            }, 30000);

            return () => clearInterval(autoSaveInterval);
        }
    }, [readOnly, elements.length, isSaving, handleSave]);

    // Load canvas data on component mount
    useEffect(() => {
        loadCanvasData();
    }, [canvasId, organizationId, projectId]);

    // Keyboard navigation shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Only handle if not in an input field
            if (
                event.target.tagName === "INPUT" ||
                event.target.tagName === "TEXTAREA"
            ) {
                return;
            }

            // Escape key - go back
            if (event.key === "Escape") {
                event.preventDefault();
                router.push(
                    projectId
                        ? `/project/${projectId}`
                        : `/organization/${organizationId}`
                );
            }

            // Ctrl/Cmd + S - save
            if ((event.ctrlKey || event.metaKey) && event.key === "s") {
                event.preventDefault();
                if (!readOnly) {
                    handleSave();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router, projectId, organizationId, readOnly, handleSave]);

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
                    setAppState({
                        ...data.appState,
                        viewModeEnabled: readOnly,
                        collaborators: new Map(), // Always ensure Map for collaborators
                    });
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

    const handleChange = (newElements, newAppState) => {
        // Prevent infinite loops
        if (isUpdatingRef.current) return;

        isUpdatingRef.current = true;

        try {
            setElements(newElements);

            // Create a stable appState without causing re-renders
            setAppState((prevAppState) => ({
                ...newAppState,
                collaborators: new Map(), // Always use empty Map
                viewModeEnabled: readOnly,
            }));
        } finally {
            // Reset the flag after a timeout to allow future updates
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 0);
        }
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
            {/* Navigation Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link
                    href={`/organization/${organizationId}`}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                    <Home className="w-4 h-4" />
                    Organization
                </Link>
                {projectId && (
                    <>
                        <span>/</span>
                        <Link
                            href={`/project/${projectId}`}
                            className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                            <FolderIcon className="w-4 h-4" />
                            Project
                        </Link>
                        <span>/</span>
                        <span className="text-foreground">Canvas</span>
                    </>
                )}
                {!projectId && (
                    <>
                        <span>/</span>
                        <span className="text-foreground">Canvas</span>
                    </>
                )}
            </div>

            {/* Canvas Header */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Back Button */}
                            <Link
                                href={
                                    projectId
                                        ? `/project/${projectId}`
                                        : `/organization/${organizationId}`
                                }
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </Button>
                            </Link>

                            <div className="flex items-center gap-3">
                                <CardTitle className="flex items-center gap-2">
                                    {title}
                                </CardTitle>
                                <Badge variant="outline">
                                    {readOnly ? "View Only" : "Collaborative"}
                                </Badge>
                            </div>
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
                                    viewModeEnabled: readOnly,
                                    collaborators: new Map(),
                                },
                            }}
                            onChange={handleChange}
                            UIOptions={{
                                canvasActions: {
                                    loadScene: false,
                                    saveAsImage: {
                                        saveFileToDisk: false,
                                    },
                                    export: {
                                        saveFileToDisk: false,
                                    },
                                },
                                tools: {
                                    image: true,
                                },
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Canvas Instructions */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
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
                        <div>
                            <h4 className="font-medium text-foreground mb-2">
                                Navigation:
                            </h4>
                            <ul className="space-y-1">
                                <li>
                                    • <kbd>Esc</kbd> - Go back to{" "}
                                    {projectId ? "project" : "organization"}
                                </li>
                                <li>
                                    • Use the &quot;Back&quot; button or
                                    breadcrumbs
                                </li>
                                <li>• Auto-save every 30 seconds</li>
                                <li>
                                    • Manual save with button or{" "}
                                    <kbd>Ctrl+S</kbd>
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
