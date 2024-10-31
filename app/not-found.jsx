import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm text-center px-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-2/6 bg-lime-500 opacity-20 blur-3xl rounded-full pointer-events-none"></div>
      </div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-lime-200 via-lime-500 to-lime-700 mb-8">
          404
        </h1>
        <p className="text-lg md:text-xl text-neutral-300 mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/">
          <Button className="px-8 h-14 font-bold rounded-full text-lg bg-lime-500 text-black hover:bg-lime-600 transition-all duration-300 hover:scale-105">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
