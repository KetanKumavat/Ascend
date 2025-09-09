import { useRef, useEffect, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Play,
    Zap,
    Users,
    Brain,
} from "lucide-react";

const features = [
    {
        title: "Smart Meetings",
        description:
            "High-quality video calls with real-time transcription, AI summaries, and automatic action item extraction.",
        image: "/meeting-mockup.jpg",
        alt: "Video meeting with live transcription",
        icon: Users,
        tag: "Collaborative",
    },
    {
        title: "Interactive Canvas",
        description:
            "Whiteboard and diagramming tools for brainstorming, system design, and visual collaboration in real-time.",
        image: "/dashboard-mockup.jpg",
        alt: "Interactive whiteboard canvas",
        icon: Play,
        tag: "Creative",
    },
    {
        title: "Kanban Boards",
        description:
            "Drag-and-drop issue tracking with custom workflows, sprint planning, and team velocity insights.",
        image: "/transcript-mockup.png",
        alt: "Kanban board with drag and drop",
        icon: Brain,
        tag: "Organized",
    },
    {
        title: "GitHub Integration",
        description:
            "Automatic commit tracking, code review insights, and AI-powered development reports with deployment analytics.",
        image: "/ai-report-mockup.jpg",
        alt: "GitHub integration dashboard",
        icon: Zap,
        tag: "Connected",
    },
];

const FeatureShowcase = () => {
    const scrollRef = useRef(null);
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
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-100 mb-6">
                        Work in{" "}
                        <span className="bg-gradient-to-r from-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                            Flow
                        </span>
                    </h2>
                    <p className="text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed">
                        Seamless interfaces designed for modern teams who demand
                        both beauty and function. Every interaction is crafted
                        for efficiency and delight.
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
                                                <div className="relative bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border border-neutral-700/50 rounded-3xl backdrop-blur-xl overflow-hidden">
                                                    {/* Subtle Hover Effect */}
                                                    <div className="absolute inset-0 bg-neutral-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                    <div className="relative z-10 grid md:grid-cols-2 gap-8 p-8 lg:p-12">
                                                        {/* Content Side */}
                                                        <div className="flex flex-col justify-center space-y-6">
                                                            {/* Tag */}
                                                            <div className="inline-flex items-center gap-2 w-fit">
                                                                <div className="p-2 bg-neutral-800/80 border border-neutral-600/30 rounded-xl">
                                                                    <Icon className="w-5 h-5 text-neutral-300" />
                                                                </div>
                                                                <span className="text-sm font-medium text-neutral-400 uppercase tracking-wide">
                                                                    {
                                                                        feature.tag
                                                                    }
                                                                </span>
                                                            </div>

                                                            {/* Title */}
                                                            <h3 className="text-3xl lg:text-4xl font-bold text-neutral-100 leading-tight">
                                                                {feature.title}
                                                            </h3>

                                                            {/* Description */}
                                                            <p className="text-lg text-neutral-300 leading-relaxed">
                                                                {
                                                                    feature.description
                                                                }
                                                            </p>

                                                            {/* Progress Indicators */}
                                                            <div className="flex items-center gap-3 pt-4">
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
                                                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                                                i ===
                                                                                currentIndex
                                                                                    ? "w-8 bg-neutral-200"
                                                                                    : "w-2 bg-neutral-600 hover:bg-neutral-400"
                                                                            }`}
                                                                        />
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Image Side */}
                                                        <div className="relative">
                                                            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-800">
                                                                <img
                                                                    src={
                                                                        feature.image
                                                                    }
                                                                    alt={
                                                                        feature.alt
                                                                    }
                                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                                />
                                                            </div>

                                                            {/* Floating Elements */}
                                                            <div className="absolute -top-4 -right-4 w-20 h-20 bg-neutral-700/20 rounded-full blur-2xl animate-float" />
                                                            <div
                                                                className="absolute -bottom-6 -left-6 w-24 h-24 bg-neutral-600/10 rounded-full blur-3xl animate-float"
                                                                style={{
                                                                    animationDelay:
                                                                        "-2s",
                                                                }}
                                                            />
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

                        {/* Navigation Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-neutral-900/80 border border-neutral-700/50 rounded-full text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/80 transition-all duration-200 backdrop-blur-sm group"
                        >
                            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                        </button>

                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-neutral-900/80 border border-neutral-700/50 rounded-full text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/80 transition-all duration-200 backdrop-blur-sm group"
                        >
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    {/* Mini Preview Cards */}
                    <div className="flex justify-center gap-4 mt-12">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={() => scrollToIndex(index)}
                                    className={`group relative p-4 rounded-2xl border transition-all duration-300 ${
                                        index === currentIndex
                                            ? "bg-neutral-800/80 border-neutral-600/50 scale-105"
                                            : "bg-neutral-900/50 border-neutral-700/30 hover:bg-neutral-800/60 hover:border-neutral-600/40"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`p-2 rounded-lg transition-colors ${
                                                index === currentIndex
                                                    ? "bg-neutral-700/80"
                                                    : "bg-neutral-800/80 group-hover:bg-neutral-700/80"
                                            }`}
                                        >
                                            <Icon className="w-4 h-4 text-neutral-300" />
                                        </div>
                                        <span className="text-sm font-medium text-neutral-300 whitespace-nowrap">
                                            {feature.title}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Auto-play indicator */}
                    <div className="flex justify-center mt-8">
                        <div className="flex items-center gap-2 px-3 py-2 bg-neutral-900/50 border border-neutral-700/30 rounded-full text-xs text-neutral-500">
                            <div
                                className={`w-2 h-2 rounded-full ${
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

            {/* Background Elements */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-neutral-800/3 rounded-full blur-3xl animate-float" />
            <div
                className="absolute bottom-1/4 right-0 w-64 h-64 bg-neutral-700/5 rounded-full blur-3xl animate-float"
                style={{ animationDelay: "-3s" }}
            />
        </section>
    );
};

export default FeatureShowcase;
