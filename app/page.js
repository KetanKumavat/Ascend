"use client";
import React from "react";
import Hero from "@/components/hero";
import InteractiveStory from "@/components/interactive-story";
import FeatureShowcase from "@/components/feature-showcase";
import VisionStatement from "@/components/vision-statement";
import FinalCTA from "@/components/final-cta";

const Home = () => {
    return (
        <main className="min-h-screen bg-void text-neutral-100 overflow-x-hidden">
            <Hero />
            <InteractiveStory />
            <FeatureShowcase />
            <VisionStatement />
            <FinalCTA />
        </main>
    );
};

export default Home;
