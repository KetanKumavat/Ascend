import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const storySteps = [
    {
        title: "Create your workspace",
        description:
            "Set up your project with integrated kanban boards, canvas tools, and team collaboration features.",
        image: "/ascend-dash.png",
        alt: "Project workspace with kanban and canvas",
    },
    {
        title: "Collaborate in real-time",
        description:
            "Jump into HD video meetings with live transcription, screen sharing, and interactive whiteboard sessions.",
        image: "/ascend-meet.png",
        alt: "Meeting with transcription and canvas",
    },
    {
        title: "Track everything automatically",
        description:
            "Every conversation transcribed, every commit tracked, every decision documented with intelligent categorization.",
        image: "/screenshots/project-dashboard.png",
        alt: "Automatic transcription and tracking",
    },
    {
        title: "Get AI-powered insights",
        description:
            "Transform your project data into actionable reports with development analytics, team performance, and progress tracking.",
        image: "/ascend-git.png",
        alt: "AI insights and analytics dashboard",
    },
];

const InteractiveStory = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [visibleSteps, setVisibleSteps] = useState(new Set([0]));
    const sectionRef = useRef(null);
    const stepRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const stepIndex = parseInt(
                        entry.target.getAttribute("data-step") || "0"
                    );
                    if (entry.isIntersecting) {
                        setVisibleSteps(
                            (prev) => new Set([...prev, stepIndex])
                        );
                        setActiveStep(stepIndex);
                    }
                });
            },
            { threshold: 0.5 }
        );

        stepRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="py-28 relative">
            <div className="container-wide section-padding">
                <div className="text-center mb-20">
                    <h2 className="text-5xl md:text-6xl font-bold text-neutral-100 mb-6">
                        Your journey to better collaboration
                    </h2>
                    <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
                        From scattered conversations to organized knowledge,
                        Ascend transforms how teams work together.
                    </p>
                </div>

                <div className="space-y-40">
                    {storySteps.map((step, index) => (
                        <div
                            key={index}
                            ref={(el) => (stepRefs.current[index] = el)}
                            data-step={index}
                            className={`grid lg:grid-cols-2 gap-16 items-center transition-all duration-1000 ${
                                visibleSteps.has(index)
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-20"
                            } ${
                                index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
                            }`}
                        >
                            {/* Content */}
                            <div
                                className={`space-y-6 ${
                                    index % 2 === 1 ? "lg:col-start-2" : ""
                                }`}
                            >
                                <div className="inline-flex items-center gap-3 text-neutral-300 text-sm font-medium mb-4">
                                    <div className="w-8 h-8 rounded-full bg-neutral-700/20 border border-neutral-600/30 flex items-center justify-center text-neutral-200 font-bold">
                                        {index + 1}
                                    </div>
                                    Step {index + 1}
                                </div>

                                <h3 className="text-4xl md:text-5xl font-bold text-neutral-100 leading-tight">
                                    {step.title}
                                </h3>

                                <p className="text-xl text-neutral-300 leading-relaxed">
                                    {step.description}
                                </p>

                                {/* Progress Indicator */}
                                <div className="flex gap-2 pt-6">
                                    {storySteps.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1 rounded-full transition-all duration-500 ${
                                                i <= activeStep
                                                    ? "bg-neutral-300 w-12"
                                                    : "bg-neutral-700 w-8"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Image */}
                            <div
                                className={`relative ${
                                    index % 2 === 1 ? "lg:col-start-1" : ""
                                }`}
                            >
                                <div className="relative glassmorphic rounded-2xl p-1 glow-soft">
                                    <div className="bg-deep rounded-xl overflow-hidden">
                                        <Image
                                            src={step.image}
                                            alt={step.alt}
                                            className="w-full h-auto transform hover:scale-105 transition-transform duration-500"
                                            width={600}
                                            height={400}
                                        />
                                    </div>
                                </div>

                                {/* Floating Elements */}
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-neutral-700/10 rounded-full blur-2xl animate-float" />
                                <div
                                    className="absolute -bottom-6 -left-6 w-32 h-32 bg-neutral-800/5 rounded-full blur-3xl animate-float"
                                    style={{ animationDelay: "-2s" }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InteractiveStory;
