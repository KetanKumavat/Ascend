import React from "react";
import { BackgroundBeamsWithCollision } from "@/components/ui/aurora";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <BackgroundBeamsWithCollision className="w-full min-h-screen relative z-10 flex items-center justify-center overflow-hidden">
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 mt-36 -translate-y-1/2 w-1/2 h-2/6 bg-lime-500 opacity-20 blur-3xl rounded-full pointer-events-none"></div>

      <main className="flex flex-col items-center text-center max-w-4xl w-full px-6 md:px-12 rounded-lg relative z-20">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold  mb-6 leading-tight md:leading-tight lg:leading-tight">
          Elevate your team&apos;s productivity with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-lime-200 via-lime-500 to-lime-700 font-extrabold block mt-4 text-7xl md:text-8xl lg:text-9xl">
            Ascend
          </span>
        </h1>

        <p className="text-lg md:text-xl font-normal text-neutral-300 max-w-2xl mx-auto mb-10">
          Ascend — a collaborative project management app designed to streamline
          workflows, enhance communication, and drive success. Get things done
          together, effortlessly!
        </p>

        <div className="flex sm:flex-row gap-4 justify-center items-center">
          <Button className="px-8 py-3 h-14 font-bold rounded-full text-base sm:text-lg transition-all duration-300 ease-in-out hover:scale-105">
            Learn More
          </Button>
          <Button className="px-8 py-3 h-14 font-bold rounded-full text-base sm:text-lg bg-lime-500 text-black hover:bg-lime-600 transition-all duration-300 ease-in-out hover:scale-105">
            Get Started!
          </Button>
        </div>
      </main>
    </BackgroundBeamsWithCollision>
  );
};

export default Home;
