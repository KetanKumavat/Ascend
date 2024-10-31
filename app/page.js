import React from "react";
import { BackgroundBeamsWithCollision } from "@/components/ui/aurora";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <BackgroundBeamsWithCollision className="w-full min-h-screen relative z-10 flex items-center justify-center bg-white">
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 mt-44 -translate-y-1/2 w-96 h-96 bg-lime-400 opacity-20 blur-3xl rounded-full pointer-events-none"></div>
      <main className="flex flex-col items-center text-center max-w-3xl p-6 rounded-lg relative z-20">
        <h1 className="text-8xl md:text-9xl font-extrabold pb-4 text-transparent bg-clip-text bg-gradient-to-b from-lime-200 via-lime-500 to-lime-700">
          Ascend
        </h1>
        <p className="text-xl md:text-3xl font-normal text-neutral-300 pb-8">
          Elevate your team&apos;s productivity with Ascend—a collaborative
          project management app designed to streamline workflows, enhance
          communication, and drive success. Get things done together,
          effortlessly!
        </p>
        <Button className="px-6 py-1 h-12 font-bold rounded-full text-xl bg-lime-500 text-black hover:bg-lime-600">
          Try it out!
        </Button>
      </main>
    </BackgroundBeamsWithCollision>
  );
};

export default Home;
