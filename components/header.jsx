// import ModeToggle from "@/components/theme-toggler";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { ChartNoAxesCombined, PenBox } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserMenu from "./ui/user-menu";
import SignInBtn from "./ui/signin-btn";

import React from "react";
import { checkUser } from "@/lib/checkUser";

const Header = async () => {
  await checkUser();
  return (
    <header className="flex justify-between items-center left-1/2 -translate-x-1/2 p-4 bg-neutral-400 fixed top-8 w-[min(768px,100%_-_2rem)] min-w-fit rounded-full bg-opacity-15 backdrop-blur-md shadow-lg border-white border border-opacity-10 z-50">
      <Link href="/" className="flex gap-2">
        <div className="absolute mt-4 top-1/3 left-2 transform -translate-x-1 -translate-y-1/2 w-36 h-20 bg-lime-500 opacity-50 blur-3xl rounded-full pointer-events-none"></div>
        <ChartNoAxesCombined className="w-10 h-10 text-black dark:text-white cursor-pointer" />
        <h1 className="text-3xl mt-1 font-bold">
          <span className="text-lime-500">A</span>scend
        </h1>
      </Link>
      <div className="flex gap-2 justify-center items-center">
        <Link href={"/project/create"}>
          <Button
            variant="default"
            className="px-4 py-6 h-10 text-md font-medium rounded-full items-center gap-2 md:flex bg-white text-black hover:bg-neutral-300">
            <PenBox size={20} className="font-bold" />
            <span className="text-md font-bold hidden md:block">
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
        {/* <ModeToggle /> */}
      </div>
    </header>
  );
};

export default Header;
