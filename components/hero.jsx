import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import peerlistDark from "@/public/peerlist-dark.svg";

const Hero = () => {
    return (
        <section className="min-h-screen relative flex items-center justify-center pt-28">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neutral-800/5 rounded-full blur-3xl animate-float" />
            <div
                className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-neutral-700/5 rounded-full blur-3xl animate-float"
                style={{ animationDelay: "-3s" }}
            />

            <div className="container-wide section-padding text-center relative z-10">
                <div className="max-w-5xl mx-auto space-y-8">
                    <div className="flex justify-center">
                        <Link
                            href="https://peerlist.io/ketankumavat/project/ascend"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:scale-105 transition-transform bg-none"
                        >
                            <Image
                                src={peerlistDark}
                                alt="Peerlist logo"
                                className="md:w-56 w-44"
                            />
                        </Link>
                    </div>

                    <div className="space-y-6">
                        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-1/2 bg-lime-600 md:opacity-10 opacity-30 blur-3xl rounded-full pointer-events-none -z-50"></div>
                        <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold leading-tight md:leading-tight lg:leading-tight cursor-default">
                            Elevate your team&apos;s productivity with{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-b from-lime-200 via-lime-500 to-lime-700 font-extrabold block mt-2 text-5xl md:text-8xl lg:text-9xl">
                                Ascend
                            </span>
                        </h1>
                        <p className="mt-8 text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto cursor-default">
                            Ascend — a collaborative project management app
                            designed to streamline workflows, enhance
                            communication, and drive success. Get things done
                            together, effortlessly!
                        </p>
                    </div>
                    <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-6">
                        <Link href="/onboarding">
                            <button className="relative group px-6 py-2.5 bg-white text-neutral-900 font-semibold rounded-full hover:bg-neutral-200 transform transition-all duration-300 text-base">
                                <span className="flex items-center gap-2">
                                    Start Building
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
