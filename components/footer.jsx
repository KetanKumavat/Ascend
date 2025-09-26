import React from "react";
import Link from "next/link";
import { GitHub, Twitter, Linkedin } from "./ui/social-icons";
import Image from "next/image";

const Footer = () => {
    return (
        <footer className="px-4 pt-2 md:px-8 pb-6 relative overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/50 rounded-2xl shadow-lg">
                    <div className="px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center space-x-6">
                            <Link
                                href="https://linkedin.com/in/ketankumavat"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center text-neutral-400 hover:text-neutral-200 transition-colors duration-300"
                            >
                                <Linkedin className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                            </Link>

                            <Link
                                href="https://x.com/KetanK004"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center text-neutral-400 hover:text-neutral-200 transition-colors duration-300"
                            >
                                <Twitter className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                            </Link>

                            <Link
                                href="https://github.com/KetanKumavat"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center text-neutral-400 hover:text-neutral-200 transition-colors duration-300"
                            >
                                <GitHub className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                            </Link>
                        </div>

                        <div className="flex items-center space-x-6 text-sm">
                            <Link
                                href="/privacy"
                                className="text-neutral-400 hover:text-neutral-200 transition-colors duration-300"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms"
                                className="text-neutral-400 hover:text-neutral-200 transition-colors duration-300"
                            >
                                Terms & Conditions
                            </Link>
                        </div>

                        <Link href="/" className="flex items-center space-x-2">
                            <Image
                                src="/logo.png"
                                alt="Ascend Logo"
                                width={30}
                                height={30}
                                className="h-auto"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
