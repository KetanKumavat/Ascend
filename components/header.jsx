// import ModeToggle from "@/components/theme-toggler";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { ChartNoAxesCombined, PenBox } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserMenu from "./ui/user-menu";
import SignInBtn from "./ui/signin-btn";

import { checkUser } from "@/lib/checkUser";

const Header = async () => {
    await checkUser();

    return (
        <header className="flex justify-between items-center left-1/2 -translate-x-1/2 p-4 gap-3 bg-neutral-400 fixed top-2 w-[min(768px,100%_-_2rem)] min-w-fit rounded-full bg-opacity-15 backdrop-blur-md shadow-lg border-white border border-opacity-10 z-[100]">
            <Link href="/" className="pl-2 flex gap-2 items-center">
                <div className="absolute mt-2 top-1/2 left-2 transform -translate-x-1 -translate-y-1/2 w-24 h-12 bg-neutral-600 opacity-50 blur-3xl rounded-full pointer-events-none"></div>
                <ChartNoAxesCombined className="w-6 h-6 text-black dark:text-white cursor-pointer" />
                <h1 className="text-lg font-bold">
                    <span className="text-neutral-100">A</span>scend
                </h1>
            </Link>
            <div className="flex gap-2 justify-center items-center">
                <Link href={"/project/create"}>
                    <Button
                        variant="default"
                        className="px-2 text-xs font-medium rounded-full items-center gap-1 md:flex bg-white text-black hover:bg-neutral-300"
                    >
                        <PenBox size={14} className="font-bold" />
                        <span className="text-xs font-bold hidden md:block">
                            Create Project
                        </span>
                    </Button>
                </Link>
                <SignedIn>
                    <UserMenu />
                </SignedIn>
                <SignedOut>
                    <SignInBtn />
                </SignedOut>
            </div>
        </header>
    );
};

export default Header;
