import { useEffect, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Play,
    Zap,
    Users,
    Brain,
} from "lucide-react";
import Image from "next/image";

const features = [
    {
        title: "Smart Meetings",
        description:
            "High-quality video calls with real-time transcription, AI summaries, and automatic action item extraction.",
        image: "/ascend-meet.png",
        alt: "Video meeting with live transcription",
        icon: Users,
        tag: "Collaborative",
    },
    {
        title: "Interactive Canvas",
        description:
            "Whiteboard and diagramming tools for brainstorming, system design, and visual collaboration in real-time.",
        image: "/ascend-dash.png",
        alt: "Interactive whiteboard canvas",
        icon: Play,
        tag: "Creative",
    },
    {
        title: "Kanban Boards",
        description:
            "Drag-and-drop issue tracking with custom workflows, sprint planning, and team velocity insights.",
        image: "/screenshots/project-dashboard.png",
        alt: "Kanban board with drag and drop",
        icon: Brain,
        tag: "Organized",
    },
    {
        title: "GitHub Integration",
        description:
            "Automatic commit tracking, code review insights, and AI-powered development reports with deployment analytics.",
        image: "/ascend-git.png",
        alt: "GitHub integration dashboard",
        icon: Zap,
        tag: "Connected",
    },
];

const FeatureShowcase = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-scroll functionality
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % features.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    // Scroll to specific index
    const scrollToIndex = (index) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);

        // Resume auto-play after 8 seconds
        setTimeout(() => setIsAutoPlaying(true), 8000);
    };

    const nextSlide = () => {
        scrollToIndex((currentIndex + 1) % features.length);
    };

    const prevSlide = () => {
        scrollToIndex(
            currentIndex === 0 ? features.length - 1 : currentIndex - 1
        );
    };

    return (
        <section className="py-32 relative overflow-hidden">
            <div className="container-wide section-padding">
                {/* Section Header */}
                <div className="text-center mb-12 md:mb-20">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-100 mb-4 md:mb-6">
                        Work in Flow
                    </h2>
                    <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed px-4">
                        Seamless interfaces designed for modern teams who demand
                        both beauty and function.
                    </p>
                </div>

                {/* Main Carousel */}
                <div className="relative max-w-7xl mx-auto">
                    {/* Featured Card */}
                    <div className="relative">
                        <div className="overflow-hidden rounded-3xl">
                            <div
                                className="flex transition-transform duration-700 ease-out"
                                style={{
                                    transform: `translateX(-${
                                        currentIndex * 100
                                    }%)`,
                                }}
                            >
                                {features.map((feature, index) => {
                                    const Icon = feature.icon;
                                    return (
                                        <div
                                            key={index}
                                            className="w-full flex-shrink-0"
                                        >
                                            <div className="relative group">
                                                {/* Main Card Container */}
                                                <div className="relative bg-neutral-900/60 border border-neutral-700/30 rounded-2xl backdrop-blur-sm overflow-hidden w-full shadow-sm hover:shadow-lg transition-all duration-300">
                                                    {/* Subtle Hover Effect */}
                                                    <div className="absolute inset-0 bg-neutral-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                                    <div className="relative z-10 grid md:grid-cols-2 gap-6 md:gap-8 p-4 md:p-6 lg:p-8">
                                                        {/* Content Side */}
                                                        <div className="flex flex-col justify-center space-y-4 md:space-y-6">
                                                            {/* Tag */}
                                                            <div className="inline-flex items-center gap-2 w-fit">
                                                                <div className="p-1.5 bg-neutral-800/60 border border-neutral-600/20 rounded-lg">
                                                                    <Icon className="w-4 h-4 text-neutral-400" />
                                                                </div>
                                                                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                                                                    {
                                                                        feature.tag
                                                                    }
                                                                </span>
                                                            </div>

                                                            {/* Title */}
                                                            <h3 className="text-2xl md:text-3xl lg:text-3xl font-semibold text-neutral-100 leading-tight">
                                                                {feature.title}
                                                            </h3>

                                                            {/* Description */}
                                                            <p className="text-sm md:text-base text-neutral-400 leading-relaxed">
                                                                {
                                                                    feature.description
                                                                }
                                                            </p>

                                                            {/* Progress Indicators - Hide on mobile */}
                                                            <div className="hidden md:flex items-center gap-3 pt-2">
                                                                {features.map(
                                                                    (_, i) => (
                                                                        <button
                                                                            key={
                                                                                i
                                                                            }
                                                                            onClick={() =>
                                                                                scrollToIndex(
                                                                                    i
                                                                                )
                                                                            }
                                                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                                                i ===
                                                                                currentIndex
                                                                                    ? "w-6 bg-neutral-300"
                                                                                    : "w-1.5 bg-neutral-600 hover:bg-neutral-500"
                                                                            }`}
                                                                        />
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Image Side */}
                                                        <div className="relative order-first md:order-last">
                                                            <div className="aspect-[4/3] md:aspect-[4/3] rounded-xl overflow-hidden bg-neutral-800/50">
                                                                <Image
                                                                    src={
                                                                        feature.image
                                                                    }
                                                                    alt={
                                                                        feature.alt
                                                                    }
                                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                                                    width={600}
                                                                    height={400}
                                                                    unoptimized
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card Glow Effect */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-neutral-800/0 via-neutral-700/0 to-neutral-800/0 group-hover:from-neutral-700/20 group-hover:via-neutral-600/10 group-hover:to-neutral-700/20 rounded-3xl blur-xl transition-all duration-500 -z-10" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Navigation Arrows - Hidden on mobile */}
                        <button
                            onClick={prevSlide}
                            className="hidden md:block absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 p-2 bg-neutral-900/60 border border-neutral-700/30 rounded-full text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-all duration-200 backdrop-blur-sm group"
                        >
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </button>

                        <button
                            onClick={nextSlide}
                            className="hidden md:block absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 p-2 bg-neutral-900/60 border border-neutral-700/30 rounded-full text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-all duration-200 backdrop-blur-sm group"
                        >
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    {/* Mini Preview Cards - Simplified for mobile */}
                    <div className="flex justify-center gap-2 md:gap-4 mt-8 md:mt-12 px-4">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={() => scrollToIndex(index)}
                                    className={`group relative p-2 md:p-3 rounded-xl border transition-all duration-300 ${
                                        index === currentIndex
                                            ? "bg-neutral-800/60 border-neutral-600/40 scale-105"
                                            : "bg-neutral-900/40 border-neutral-700/20 hover:bg-neutral-800/50 hover:border-neutral-600/30"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div
                                            className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                                                index === currentIndex
                                                    ? "bg-neutral-700/60"
                                                    : "bg-neutral-800/60 group-hover:bg-neutral-700/60"
                                            }`}
                                        >
                                            <Icon className="w-3 h-3 md:w-4 md:h-4 text-neutral-400" />
                                        </div>
                                        <span className="text-xs md:text-sm font-medium text-neutral-400 whitespace-nowrap hidden sm:block">
                                            {feature.title}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Auto-play indicator - Hidden on mobile */}
                    <div className="hidden md:flex justify-center mt-6">
                        <div className="flex items-center gap-2 px-3 py-2 bg-neutral-900/40 border border-neutral-700/20 rounded-full text-xs text-neutral-500">
                            <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                    isAutoPlaying
                                        ? "bg-neutral-400 animate-pulse"
                                        : "bg-neutral-600"
                                }`}
                            />
                            {isAutoPlaying ? "Auto-playing" : "Paused"}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeatureShowcase;
