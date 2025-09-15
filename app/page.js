"use client";
import React from "react";
import Hero from "@/components/hero";
import InteractiveStory from "@/components/interactive-story";
import FeatureShowcase from "@/components/feature-showcase";
import FinalCTA from "@/components/final-cta";

const Home = () => {
    return (
        <main className="bg-void text-neutral-100 overflow-x-hidden">
            <Hero />
            <InteractiveStory />
            <FeatureShowcase />
            <FinalCTA />
        </main>
    );
};

export default Home;
