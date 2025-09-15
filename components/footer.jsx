import React from "react";
import Link from "next/link";
import { GitHub, Twitter, Linkedin } from "./ui/social-icons";

const Footer = () => {
    return (
        <footer className="bg-background/80 backdrop-blur-md border-t border-border">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
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

                    {/* Brand */}
                    <div className="flex flex-col items-center md:items-end space-y-2">
                        <div className="text-2xl text-neutral-300 font-semibold">
                            Ascend
                        </div>
                        <p className="text-sm text-foreground/60">
                            © 2025 Ketan. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
