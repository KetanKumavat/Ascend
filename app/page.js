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
import Link from "next/link";

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
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-advance carousel
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentFeatureIndex((prev) =>
                prev === features.length - 1 ? 0 : prev + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const nextFeature = () => {
        setCurrentFeatureIndex((prev) =>
            prev === features.length - 1 ? 0 : prev + 1
        );
        setIsAutoPlaying(false);
    };

    const prevFeature = () => {
        setCurrentFeatureIndex((prev) =>
            prev === 0 ? features.length - 1 : prev - 1
        );
        setIsAutoPlaying(false);
    };

    const goToFeature = (index) => {
        setCurrentFeatureIndex(index);
        setIsAutoPlaying(false);
    };
    return (
        <div className="relative w-full min-h-screen ">
            <section className="z-10 px-4 pt-24 min-h-screen grid place-content-center">
                <div className="max-w-4xl mx-auto text-center relative">
                    <div className="absolute mt-32 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-1/2 bg-lime-500 md:opacity-20 opacity-50 blur-3xl rounded-full pointer-events-none"></div>
                    <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold leading-tight md:leading-tight lg:leading-tight cursor-default">
                        Elevate your team&apos;s productivity with{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-lime-200 via-lime-500 to-lime-700 font-extrabold block mt-2 text-5xl md:text-8xl lg:text-9xl">
                            Ascend
                        </span>
                    </h1>
                    <p className="mt-8 text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto cursor-default">
                        Ascend — a collaborative project management app designed
                        to streamline workflows, enhance communication, and
                        drive success. Get things done together, effortlessly!
                    </p>
                    <div className="mt-12 flex gap-4 justify-center">
                        <Link href="#how-it-works">
                            <Button className="md:px-8 px-6 h-14 font-bold rounded-full text-lg bg-white/90 hover:bg-white/70 transition-all duration-300 hover:scale-105">
                                Learn More
                            </Button>
                        </Link>
                        <Link href="/onboarding">
                            <Button className="md:px-8 px-6 h-14 font-bold rounded-full text-lg bg-lime-500 text-black hover:bg-lime-600 transition-all duration-1000 hover:scale-105">
                                Get Started!
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-neutral-400">
                    <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-lime-500" />
                        <span>Video Meetings</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-lime-500" />
                        <span>AI Transcription</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-lime-500" />
                        <span>GitHub Integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-lime-500" />
                        <span>Secure</span>
                    </div>
                </div>
            </section>

            <section
                className="relative py-24 w-full mx-auto  overflow-hidden"
                id="how-it-works"
            >
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-5xl md:text-6xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600 mb-6">
                        How It Works
                    </h2>
                    <p className="text-lg text-neutral-400 mb-16 text-center max-w-2xl mx-auto">
                        Follow a simple flow to get your team working
                        efficiently with Ascend.
                    </p>

                    {/* Zig-Zag Flowchart */}
                    <div className="relative">
                        <div className="absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-lime-600/40 via-neutral-700/30 to-lime-500/40 rounded-full"></div>
                        <div className="space-y-20">
                            {processSteps.map((step, index) => {
                                const StepIcon = step.icon;
                                const isEven = index % 2 === 0;
                                return (
                                    <div
                                        key={index}
                                        className={`relative flex items-center justify-between w-full ${
                                            isEven
                                                ? "flex-row"
                                                : "flex-row-reverse"
                                        }`}
                                    >
                                        {/* Connector Dot */}
                                        <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-lime-500 rounded-full border-4 border-neutral-950 shadow-lg shadow-lime-500/30 z-10"></div>

                                        {/* Step Card */}
                                        <div
                                            className={`w-5/12 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl hover:shadow-lime-500/20 transition-all duration-300 ${
                                                isEven
                                                    ? "text-right"
                                                    : "text-left"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-lime-500 to-lime-600 shadow-md shadow-lime-600/30">
                                                    <StepIcon className="w-6 h-6 text-black" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-white">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-neutral-400">
                                                {step.description}
                                            </p>
                                        </div>

                                        {/* Spacer for symmetry */}
                                        <div className="w-5/12"></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <section
                className="relative py-24 z-50 bg-transparent"
                id="features"
            >
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-bold mb-6">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600 cursor-default">
                                Features
                            </span>
                        </h2>
                        <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
                            Everything you need to manage projects, collaborate
                            with your team, and deliver exceptional results
                        </p>
                    </div>

                    {/* Carousel Container */}
                    <div className="relative">
                        {/* Main Feature Display */}
                        <div className="relative overflow-hidden">
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{
                                    transform: `translateX(-${
                                        currentFeatureIndex * 100
                                    }%)`,
                                }}
                            >
                                {features.map((feature, index) => {
                                    const FeatureIcon = feature.icon;
                                    return (
                                        <div
                                            key={index}
                                            className="w-full flex-shrink-0 px-4"
                                        >
                                            <div className="max-w-2xl mx-auto text-center">
                                                {/* Icon */}
                                                <div className="flex justify-center mb-8">
                                                    <div className="w-20 h-20 bg-gradient-to-br from-lime-500/10 to-lime-600/10 rounded-2xl flex items-center justify-center border border-lime-500/20 backdrop-blur-sm">
                                                        <FeatureIcon className="w-10 h-10 text-lime-500" />
                                                    </div>
                                                </div>

                                                {/* Category Badge */}
                                                <div className="flex justify-center mb-4">
                                                    <span className="text-xs text-lime-400 bg-lime-500/10 px-3 py-1 rounded-full border border-lime-500/20 font-medium">
                                                        {feature.category}
                                                    </span>
                                                </div>

                                                {/* Title */}
                                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                                    {feature.title}
                                                </h3>

                                                {/* Description */}
                                                <p className="text-lg text-neutral-300 leading-relaxed max-w-xl mx-auto">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={prevFeature}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm group"
                        >
                            <ChevronLeft className="w-6 h-6 text-neutral-400 group-hover:text-lime-400 transition-colors" />
                        </button>

                        <button
                            onClick={nextFeature}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm group"
                        >
                            <ChevronRight className="w-6 h-6 text-neutral-400 group-hover:text-lime-400 transition-colors" />
                        </button>
                    </div>

                    {/* Dots Indicator */}
                    <div className="flex justify-center mt-12 space-x-3">
                        {features.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToFeature(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    index === currentFeatureIndex
                                        ? "bg-lime-500 w-8"
                                        : "bg-neutral-600 hover:bg-neutral-500"
                                }`}
                            />
                        ))}
                    </div>

                    {/* Feature Grid Preview */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {features.map((feature, index) => {
                            const FeatureIcon = feature.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={() => goToFeature(index)}
                                    className={`p-4 rounded-xl border transition-all duration-300 group ${
                                        index === currentFeatureIndex
                                            ? "border-lime-500/50 bg-lime-500/5"
                                            : "border-neutral-700 bg-neutral-800/30 hover:border-neutral-600"
                                    }`}
                                >
                                    <div className="flex flex-col items-center text-center space-y-2">
                                        <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                index === currentFeatureIndex
                                                    ? "bg-lime-500/20"
                                                    : "bg-neutral-700/50 group-hover:bg-neutral-600/50"
                                            }`}
                                        >
                                            <FeatureIcon
                                                className={`w-4 h-4 transition-colors ${
                                                    index ===
                                                    currentFeatureIndex
                                                        ? "text-lime-400"
                                                        : "text-neutral-400 group-hover:text-neutral-300"
                                                }`}
                                            />
                                        </div>
                                        <span
                                            className={`text-xs font-medium transition-colors ${
                                                index === currentFeatureIndex
                                                    ? "text-lime-300"
                                                    : "text-neutral-400 group-hover:text-neutral-300"
                                            }`}
                                        >
                                            {feature.title.split(" ")[0]}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-24 w-full mx-auto text-center px-5 relative overflow-hidden">
                <div className="absolute inset-0"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <h3 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600 mb-6 cursor-default">
                        Ready to Transform Your Team?
                    </h3>
                    <p className="text-xl md:text-2xl text-neutral-300 mb-12 cursor-default leading-relaxed">
                        Join innovative teams who&apos;ve already elevated their
                        productivity with Ascend&apos;s powerful collaboration
                        platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                        <Link href="/onboarding">
                            <Button
                                size="lg"
                                className="px-12 py-6 text-xl font-semibold bg-lime-500 text-black hover:bg-lime-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-lime-500/25 rounded-full"
                            >
                                Start Free Trial
                                <Zap className="ml-2 h-6 w-6" />
                            </Button>
                        </Link>
                        <div className="text-neutral-400 text-sm">
                            <p>✓ No credit card required</p>
                            <p>✓ 14-day free trial</p>
                            <p>✓ Cancel anytime</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 text-sm text-neutral-500">
                        <span>🚀 Instant setup</span>
                        <span>🔒 Enterprise security</span>
                        <span>💬 24/7 support</span>
                        <span>🎯 99.9% uptime</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
