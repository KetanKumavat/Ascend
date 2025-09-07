import { Sparkles, Mic, Brain } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const highlights = [
    {
        icon: Mic,
        title: "Live meetings",
        description:
            "Crystal clear video calls with intelligent audio processing",
    },
    {
        icon: Sparkles,
        title: "Automatic transcription",
        description: "Every word captured and made searchable instantly",
    },
    {
        icon: Brain,
        title: "AI insights",
        description: "Transform conversations into actionable knowledge",
    },
];

const VisionStatement = () => {
    const [visibleItems, setVisibleItems] = useState(new Set());
    const sectionRef = useRef(null);
    const itemRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const itemIndex = parseInt(
                        entry.target.getAttribute("data-item") || "0"
                    );
                    if (entry.isIntersecting) {
                        setVisibleItems(
                            (prev) => new Set([...prev, itemIndex])
                        );
                    }
                });
            },
            { threshold: 0.6 }
        );

        itemRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="py-32 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-lime-400/3 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-lime-500/8 rounded-full blur-2xl" />
            </div>

            <div className="container-wide section-padding relative z-10">
                <div className="text-center max-w-5xl mx-auto">
                    {/* Main Statement */}
                    <div className="mb-20">
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-100 mb-8 leading-tight">
                            Meetings are just
                            <span className="block text-lime-400 text-glow">
                                the beginning
                            </span>
                        </h2>

                        <p className="text-xl md:text-2xl text-neutral-300 font-light leading-relaxed max-w-4xl mx-auto">
                            Ascend transforms conversations into living
                            knowledge, so your team never loses momentum.
                        </p>
                    </div>

                    {/* Connected Highlights */}
                    <div className="relative">
                        {/* Connection Lines */}
                        <svg
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            style={{ zIndex: 1 }}
                        >
                            <defs>
                                <linearGradient
                                    id="lineGradient"
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="0%"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="hsl(82, 77%, 43%)"
                                        stopOpacity="0"
                                    />
                                    <stop
                                        offset="50%"
                                        stopColor="hsl(82, 77%, 43%)"
                                        stopOpacity="0.4"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="hsl(82, 77%, 43%)"
                                        stopOpacity="0"
                                    />
                                </linearGradient>
                            </defs>

                            {/* Horizontal connecting lines */}
                            <line
                                x1="20%"
                                y1="50%"
                                x2="80%"
                                y2="50%"
                                stroke="url(#lineGradient)"
                                strokeWidth="2"
                                className="animate-pulse"
                            />
                        </svg>

                        {/* Highlights Grid */}
                        <div className="grid md:grid-cols-3 gap-12 relative z-10">
                            {highlights.map((highlight, index) => {
                                const Icon = highlight.icon;
                                return (
                                    <div
                                        key={index}
                                        ref={(el) =>
                                            (itemRefs.current[index] = el)
                                        }
                                        data-item={index}
                                        className={`text-center group transition-all duration-1000 ${
                                            visibleItems.has(index)
                                                ? "opacity-100 translate-y-0"
                                                : "opacity-0 translate-y-20"
                                        }`}
                                        style={{
                                            animationDelay: `${index * 200}ms`,
                                        }}
                                    >
                                        {/* Icon Container */}
                                        <div className="relative mx-auto mb-6">
                                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-lime-500/20 to-lime-400/10 rounded-full flex items-center justify-center border border-lime-500/30 group-hover:border-lime-400/50 transition-all duration-500 group-hover:glow-soft">
                                                <Icon className="w-8 h-8 text-lime-400 group-hover:text-lime-300 transition-colors duration-300" />
                                            </div>

                                            {/* Pulsing Ring */}
                                            <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border border-lime-500/20 animate-glow-pulse" />
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-2xl font-bold text-neutral-100 mb-3 group-hover:text-lime-400 transition-colors duration-300">
                                            {highlight.title}
                                        </h3>

                                        <p className="text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors duration-300">
                                            {highlight.description}
                                        </p>

                                        {/* Sparkle Effect */}
                                        <div className="absolute -top-2 -right-2 w-1 h-1 bg-lime-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VisionStatement;
