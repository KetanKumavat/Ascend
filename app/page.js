"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Layout, Calendar, BarChart, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Easy Kanban Boards",
    description:
      "Keep track of tasks visually and help your team stay organized with our simple Kanban boards.",
    icon: Layout,
  },
  {
    title: "Effective Sprint Planning",
    description:
      "Plan sprints easily and keep your team on track to meet goals smoothly.",
    icon: Calendar,
  },
  {
    title: "Clear Reporting",
    description:
      "Get quick insights on team progress with easy-to-understand reports and analytics.",
    icon: BarChart,
  },
];

const Home = () => {
  return (
    <div className="relative w-full min-h-screen">
      <section className="z-10 px-4 mt-2 min-h-svh grid place-content-center">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute mt-32 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-1/2 bg-lime-500 md:opacity-20 opacity-50 blur-3xl rounded-full pointer-events-none"></div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight md:leading-tight lg:leading-tight">
            Elevate your team&apos;s productivity with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-lime-200 via-lime-500 to-lime-700 font-extrabold block mt-2 text-6xl md:text-8xl lg:text-9xl">
              Ascend
            </span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto">
            Ascend — a collaborative project management app designed to
            streamline workflows, enhance communication, and drive success. Get
            things done together, effortlessly!
          </p>
          <div className="mt-12 flex gap-4 justify-center">
            <Link href="#features">
              <Button className="px-8 h-14 font-bold rounded-full text-lg bg-white/90 hover:bg-white/70 transition-all duration-300 hover:scale-105">
                Learn More
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button className="px-8 h-14 font-bold rounded-full text-lg bg-lime-500 text-black hover:bg-lime-600 transition-all duration-300 hover:scale-105">
                Get Started!
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative py-24" id="features">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-20">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">
              Key Features
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-8 hover:scale-105 hover:border-lime-500 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-6">
                  <feature.icon className="h-10 w-10 text-lime-500 group-hover:text-lime-400" />
                  <h3 className="text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 w-full mx-auto text-center px-5 bg-black/70 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600 mb-6">
            Ready to Transform Your Workflow?
          </h3>
          <p className="text-lg md:text-xl text-neutral-300 mb-12">
            Join thousands of teams already using Ascend to streamline their
            projects and boost productivity.
          </p>
          <Link href="/onboarding">
            <Button
              size="lg"
              className="animate-bounce font-semibold bg-lime-500 text-black hover:bg-lime-600 transition-all">
              Start For Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
