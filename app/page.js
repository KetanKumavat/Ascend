"use client";
import React from "react";
import Hero from "@/components/hero";
import InteractiveStory from "@/components/interactive-story";
import FeatureShowcase from "@/components/feature-showcase";
import FinalCTA from "@/components/final-cta";
import LightRays from "@/components/LightRays";

const Home = () => {
    return (
        <main className="bg-void text-neutral-100 overflow-x-hidden">
            <div className="fixed inset-0 bg-gradient-to-b from-neutral-900/90 via-neutral-950 to-black/50" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(132,204,22,0.08),rgba(255,255,255,0))]" />
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#3a3a3a_1px,transparent_1px),linear-gradient(to_bottom,#3a3a3a_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-10" />

            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10">
                <LightRays
                    raysOrigin="top-center"
                    raysColor="#84cc16"
                    raysSpeed={1.0}
                    lightSpread={1.5}
                    rayLength={3.0}
                    followMouse={true}
                    mouseInfluence={0.0}
                    noiseAmount={0.05}
                    distortion={0.02}
                    fadeDistance={2.0}
                    className="opacity-100 md:opacity-50"
                />
            </div>

            {/* Content sits above */}
            <div className="relative z-20">
                <Hero />
                <InteractiveStory />
                <FeatureShowcase />
                <FinalCTA />
            </div>
        </main>
    );
};

export default Home;
