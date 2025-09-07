import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

const Hero = () => {
    const [typedText, setTypedText] = useState("");
    const [showCursor, setShowCursor] = useState(true);
    const captions = [
        "Sarah: I think we should pivot our marketing strategy...",
        "Alex: The Q3 numbers are looking really promising.",
        "Maya: Let's schedule a follow-up for next week.",
        "David: I'll send the updated designs by tomorrow.",
    ];

    useEffect(() => {
        let currentIndex = 0;
        let currentText = "";
        let isTyping = true;

        const typeText = () => {
            if (
                isTyping &&
                currentText.length < captions[currentIndex].length
            ) {
                currentText += captions[currentIndex][currentText.length];
                setTypedText(currentText);
                setTimeout(typeText, 50);
            } else if (isTyping) {
                isTyping = false;
                setTimeout(() => {
                    isTyping = true;
                    currentText = "";
                    currentIndex = (currentIndex + 1) % captions.length;
                    typeText();
                }, 2000);
            }
        };

        const timer = setTimeout(typeText, 1000);

        const cursorTimer = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 530);

        return () => {
            clearTimeout(timer);
            clearInterval(cursorTimer);
        };
    }, []);

    return (
        <section className="min-h-screen relative flex items-center justify-center pt-44">
            {/* Subtle Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neutral-800/5 rounded-full blur-3xl animate-float" />
            <div
                className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-neutral-700/5 rounded-full blur-3xl animate-float"
                style={{ animationDelay: "-3s" }}
            />

            <div className="container-wide section-padding text-center relative z-10">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Main Headline */}
                    <div className="space-y-6">
                        <div className="absolute mt-[25vh] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-1/2 bg-lime-600 md:opacity-10 opacity-30 blur-3xl rounded-full pointer-events-none"></div>
                        <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold leading-tight md:leading-tight lg:leading-tight cursor-default">
                            Elevate your team&apos;s productivity with{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-b from-lime-200 via-lime-500 to-lime-700 font-extrabold block mt-2 text-5xl md:text-8xl lg:text-9xl">
                                Ascend
                            </span>
                        </h1>
                        <p className="mt-8 text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto cursor-default">
                            Ascend — a collaborative project management app
                            designed to streamline workflows, enhance
                            communication, and drive success. Get things done
                            together, effortlessly!
                        </p>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-8">
                        <Link href="/onboarding">
                            <Button className="px-12 py-4 text-lg font-semibold bg-neutral-100 text-neutral-900 hover:bg-white transition-all duration-300 hover:scale-105 rounded-full group">
                                Get Started
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>

                    {/* Live Demo Mockup */}
                    <div className="mt-16">
                        <div className="relative max-w-4xl mx-auto">
                            <div className="relative bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 backdrop-blur-sm">
                                <div className="aspect-video bg-neutral-800 rounded-lg mb-4 overflow-hidden">
                                    <img
                                        src="/meeting-mockup.jpg"
                                        alt="Live meeting interface with real-time transcription"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Live Caption Overlay */}
                                <div className="bg-neutral-800/80 rounded-lg px-4 py-3">
                                    <div className="text-neutral-400 text-sm font-medium mb-1">
                                        Live Transcription
                                    </div>
                                    <div className="text-neutral-200 text-base">
                                        {typedText}
                                        {showCursor && (
                                            <span className="text-neutral-400">
                                                |
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
