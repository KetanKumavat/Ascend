import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import peerlistDark from "@/public/peerlist-dark.svg";
import SplitText from "./SplitText.jsx";
import { RainbowButton } from "@/components/ui/rainbow-button";

const Hero = () => {
    return (
        <section className="mt-[10vh] md:-mt-20 md:min-h-screen relative flex items-center justify-center">
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
                        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-1/2 bg-lime-600 md:opacity-5 opacity-15 blur-3xl rounded-full pointer-events-none -z-50 hidden"></div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-tight cursor-default">
                            Elevate productivity{" "}
                            <span className="flex justify-center items-center gap-3 md:gap-4 lg:gap-6 mt-4">
                                {" "}
                                with
                                <SplitText
                                    text="Ascend"
                                    className="block leading-tight text-4xl md:text-6xl lg:text-7xl font-bold"
                                    tag="span"
                                    delay={30}
                                    duration={0.6}
                                    ease="power3.out"
                                    splitType="chars"
                                    gradient={true}
                                />
                            </span>
                        </h1>
                        <p className="mt-8 text-lg md:text-xl text-white/60 mx-auto cursor-default">
                            Ascend brings your team&apos;s projects, tasks, and{" "}
                            <br />
                            communication into one seamless flow.
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <Link href="/onboarding">
                            <RainbowButton
                                className="rounded-full text-black px-8 py-4"
                                style={{ "--button-bg": "white" }}
                            >
                                <span className="flex items-center gap-2">
                                    Start Building
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </RainbowButton>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
