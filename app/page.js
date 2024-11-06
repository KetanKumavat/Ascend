"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Layout,
  Calendar,
  BarChart,
  ArrowRight,
  CheckCircle,
  UserPlus,
  Briefcase,
  Users,
  ClipboardList,
  BarChart2,
  FileText,
  CheckSquare,
} from "lucide-react";
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

const processSteps = [
  { title: "Sign Up / Log In", icon: UserPlus },
  { title: "Create or Select Organization", icon: Briefcase },
  { title: "Create a Project", icon: ClipboardList },
  { title: "Add Team Members", icon: Users },
  { title: "Add Tasks or Issues", icon: CheckCircle },
  { title: "Organize Tasks into Sprints", icon: Calendar },
  { title: "Track Progress on Sprint Board", icon: BarChart2 },
  { title: "Generate Reports", icon: FileText },
  { title: "Project Completion", icon: CheckSquare },
];

const Home = () => {
  return (
    <div className="relative w-full min-h-screen">
      <section className="z-10 px-4 mt-2 min-h-svh grid place-content-center">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute mt-32 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-1/2 bg-lime-500 md:opacity-20 opacity-50 blur-3xl rounded-full pointer-events-none"></div>
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold leading-tight md:leading-tight lg:leading-tight cursor-default">
            Elevate your team&apos;s productivity with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-lime-200 via-lime-500 to-lime-700 font-extrabold block mt-2 text-5xl md:text-8xl lg:text-9xl">
              Ascend
            </span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto cursor-default">
            Ascend — a collaborative project management app designed to
            streamline workflows, enhance communication, and drive success. Get
            things done together, effortlessly!
          </p>
          <div className="mt-12 flex gap-4 justify-center">
            <Link href="#how-it-works">
              <Button className="md:px-8 px-6 h-14 font-bold rounded-full text-lg bg-white/90 hover:bg-white/70 transition-all duration-300 hover:scale-105">
                Learn More
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button className="md:px-8 px-6 h-14 font-bold rounded-full text-lg bg-lime-500 text-black hover:bg-lime-600 transition-all duration-1000 hover:scale-105">
                Get Started!
              </Button>
            </Link>
            {/* <div className="bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-neutral-300 z-10">
              <div className="mouse-scroll mb-2">
                <div className="mouse">
                  <div className="mouse-wheel"></div>
                </div>
              </div>
              <p className="text-sm">Scroll for more</p>
            </div> */}
          </div>
        </div>

        {/* <style jsx>{`
          .mouse-scroll {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 35px;
            height: 55px;
            border: 2px solid #aaa;
            border-radius: 25px;
            position: relative;
            animation: fade-in 2s ease infinite;
            z-index: 100;
          }

          .mouse {
            width: 12px;
            height: 24px;
            border: 2px solid #aaa;
            border-radius: 20px;
            position: relative;
          }

          .mouse-wheel {
            width: 4px;
            height: 4px;
            background: #aaa;
            border-radius: 50%;
            position: absolute;
            top: 6px;
            left: 50%;
            transform: translateX(-50%);
            animation: scroll-wheel 1.5s ease infinite;
          }

          @keyframes scroll-wheel {
            0%,
            100% {
              top: 6px;
              opacity: 1;
            }
            50% {
              top: 14px;
              opacity: 0;
            }
          }

          @keyframes fade-in {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}</style> */}
      </section>

      <section
        className="relative py-20 w-full mx-auto text-center bg-black/70 backdrop-blur-sm z-0"
        id="how-it-works">
        <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600 mb-16">
          How It Works
        </h2>
        <div className="relative mx-auto flex flex-col items-center max-w-xl md:max-w-3xl">
          <div className="w-1 h-full bg-gradient-to-b from-lime-400 via-lime-600 to-lime-800 absolute left-1/2 transform -translate-x-1/2"></div>

          {processSteps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center mb-8 w-full ${
                index % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}>
              <div className="w-1/2 p-2 flex justify-center">
                <div className="bg-neutral-800/50 text-white rounded-lg p-4 shadow-lg flex items-center gap-4 border-2 border-neutral-900">
                  <step.icon className="text-lime-500 w-8 h-8" />
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative py-24 z-50" id="features">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-20">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600 cursor-default">
              Key Features
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-8 hover:scale-105 hover:border-lime-500 transition-all duration-300 group cursor-default">
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

      <section className="py-20 w-full mx-auto text-center px-5 bg-black/70 backdrop-blur-sm z-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600 mb-6 cursor-default">
            Ready to Transform Your Workflow?
          </h3>
          <p className="text-lg md:text-xl text-neutral-300 mb-12 cursor-default">
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
