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
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <LightRays
                    raysOrigin="top-center"
                    raysColor="#84cc16"
                    raysSpeed={1.0}
                    lightSpread={1.5}
                    rayLength={3.0}
                    followMouse={false}
                    mouseInfluence={0.0}
                    noiseAmount={0.05}
                    distortion={0.02}
                    fadeDistance={2.0}
                    className="opacity-100 md:opacity-50"
                />
            </div>
            <Hero />
            <InteractiveStory />
            <FeatureShowcase />
            <FinalCTA />
        </main>
    );
};

export default Home;
