import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const FinalCTA = () => {
    return (
        <section className="py-32 relative overflow-hidden">
            {/* Dramatic Background */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full bg-gradient-to-b from-neutral-800/5 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-neutral-700/10 rounded-full blur-3xl animate-float" />
                <div
                    className="absolute top-1/3 right-0 w-64 h-64 bg-neutral-800/8 rounded-full blur-3xl animate-float"
                    style={{ animationDelay: "-3s" }}
                />
            </div>

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
                            <Button className="px-12 py-6 text-lg font-semibold bg-neutral-100 text-neutral-900 hover:bg-white transition-all duration-300 hover:scale-105 rounded-full group">
                                Get Started
                                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                            </Button>
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

            {/* Bottom Glow Effect */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-32 bg-gradient-to-t from-neutral-800/10 to-transparent" />
        </section>
    );
};

export default FinalCTA;
