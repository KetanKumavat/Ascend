"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Layout,
    Calendar,
    BarChart,
    UserPlus,
    ClipboardList,
    BarChart2,
    Video,
    Mic,
    PaintBucket,
    Bot,
    Github,
    Zap,
    Shield,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Hero from "@/components/hero";
import InteractiveStory from "@/components/interactive-story";
import FeatureShowcase from "@/components/feature-showcase";
import VisionStatement from "@/components/vision-statement";
import FinalCTA from "@/components/final-cta";

const features = [
    {
        title: "Smart Kanban Boards",
        description:
            "Visualize your workflow with intuitive drag-and-drop Kanban boards. Track tasks from conception to completion with ease.",
        icon: Layout,
        category: "Project Management",
    },
    {
        title: "Live Video Meetings",
        description:
            "Connect with your team instantly using our integrated LiveKit-powered video meetings with HD quality and real-time collaboration.",
        icon: Video,
        category: "Communication",
    },
    {
        title: "AI-Powered Transcription",
        description:
            "Automatically generate meeting transcripts with AI. Never miss important details and easily search through past discussions.",
        icon: Mic,
        category: "AI Features",
    },
    {
        title: "Interactive Canvas",
        description:
            "Brainstorm, whiteboard, and collaborate visually with our interactive canvas. Perfect for design sessions and planning.",
        icon: PaintBucket,
        category: "Collaboration",
    },
    {
        title: "Sprint Planning",
        description:
            "Plan and manage sprints effectively with our advanced sprint management tools. Keep your team aligned and focused.",
        icon: Calendar,
        category: "Project Management",
    },
    {
        title: "GitHub Integration",
        description:
            "Seamlessly integrate with GitHub repositories. Sync issues, track commits, and link code changes to project tasks.",
        icon: Github,
        category: "Developer Tools",
    },
    {
        title: "AI Daily Reports",
        description:
            "Leverage AI to automatically generate end-of-day reports that summarize team progress and provide actionable insights.",
        icon: Bot,
        category: "AI Features",
    },
];

const processSteps = [
    {
        title: "Sign Up & Create Organization",
        icon: UserPlus,
        description: "Get started with your free account",
    },
    {
        title: "Create Your First Project",
        icon: ClipboardList,
        description: "Set up your workspace in minutes",
    },
    {
        title: "Connect GitHub Repository",
        icon: Github,
        description: "Sync code and issues seamlessly",
    },
    {
        title: "Start Video Meetings",
        icon: Video,
        description: "Collaborate live with your team",
    },
    {
        title: "Use AI Transcription",
        icon: Mic,
        description: "Get instant summaries of discussions",
    },
    {
        title: "Track Progress",
        icon: BarChart2,
        description: "Monitor and optimize productivity",
    },
];
const Home = () => {
    return (
        <main className="min-h-screen bg-void text-neutral-100 overflow-x-hidden">
            <Hero />
            <InteractiveStory />
            <FeatureShowcase />
            <VisionStatement />
            <FinalCTA />
        </main>
    );
};

export default Home;
