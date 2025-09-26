import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { RainbowButton } from "./ui/rainbow-button";

const FinalCTA = () => {
    return (
        <section className="py-32 relative overflow-hidden">
            <div className="container-wide section-padding relative z-10">
                <div className="text-center max-w-4xl mx-auto space-y-12">
                    {/* Main Headline */}
                    <div className="space-y-6">
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-100 leading-tight">
                            Start your first project
                            <span className="block text-neutral-200">
                                with{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-b from-lime-200 via-lime-500 to-lime-700 font-extrabold">
                                    Ascend
                                </span>{" "}
                                today
                            </span>
                        </h2>

                        <p className="text-xl md:text-2xl text-neutral-300 font-light leading-relaxed">
                            Join teams who are already transforming their
                            collaboration
                        </p>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-8">
                        <Link href="/onboarding">
                            <RainbowButton
                                className="rounded-full text-black px-8 py-4"
                                style={{ "--button-bg": "white" }}
                            >
                                <span className="flex items-center gap-2">
                                    Get Started
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </RainbowButton>
                        </Link>
                    </div>

                    {/* Subtle Additional Info */}
                    <div className="pt-8 space-y-4">
                        {/* Trust Indicators */}
                        <div className="flex items-center justify-center gap-8 pt-6">
                            <div className="flex items-center gap-2 text-neutral-600">
                                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" />
                                <span className="text-sm">
                                    Secure & Private
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-600">
                                <div
                                    className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse"
                                    style={{ animationDelay: "0.5s" }}
                                />
                                <span className="text-sm">Real-time Sync</span>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-600">
                                <div
                                    className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse"
                                    style={{ animationDelay: "1s" }}
                                />
                                <span className="text-sm">AI-Powered</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FinalCTA;
