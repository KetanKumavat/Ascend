import React from "react";
import Link from "next/link";
import { GitHub, Twitter, Linkedin } from "./ui/social-icons";

const Footer = () => {
    return (
        <footer className="bg-neutral-900/50 backdrop-blur-md border-t border-border">
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex flex-row justify-around md:justify-between items-center">
                    <div className="flex items-center space-x-6">
                        <Link
                            href="https://linkedin.com/in/ketankumavat"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center space-x-2 text-foreground/80 hover:text-foreground transition-colors duration-300"
                        >
                            <Linkedin className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                        </Link>

                        <Link
                            href="https://x.com/KetanK004"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center space-x-2 text-foreground/80 hover:text-foreground transition-colors duration-300"
                        >
                            <Twitter className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                        </Link>
                        <Link
                            href="https://github.com/KetanKumavat"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center space-x-2 text-foreground/80 hover:text-foreground transition-colors duration-300"
                        >
                            <GitHub className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                        </Link>
                    </div>
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-2xl text-neutral-300 font-semibold text-transparent bg-clip-text bg-gradient-to-b from-lime-200 via-lime-500 to-lime-700">
                            Ascend
                        </span>
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
