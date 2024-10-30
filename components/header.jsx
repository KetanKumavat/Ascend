import React from "react";
// import ModeToggle from "@/components/theme-toggler";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ChartNoAxesCombined, PenBox } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserMenu from "./ui/user-menu";
import SignInBtn from "./ui/signin-btn";

const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 bg-neutral-100 dark:bg-neutral-800 w-full sticky top-0">
      <Link href="/" className="flex gap-4">
        <ChartNoAxesCombined className="w-10 h-10 text-black dark:text-white cursor-pointer" />
        <h1 className="text-3xl mt-1 font-bold">Ascend</h1>
        {/* <p>Elevate your team's productivity with Ascend</p> */}
      </Link>
      <div className="flex gap-2">
        <Link href={"/project/create"}>
          <Button
            variant="default"
            className="px-4 py-6 h-10 text-md font-semibold rounded-full flex items-center gap-2 mt-3">
            <PenBox size={20} className="font-bold" />
            <span className="text-md font-bold ">Create Project</span>
          </Button>
        </Link>
        <SignedIn>
          <UserMenu />
        </SignedIn>
        <SignedOut>
          <SignInBtn />
        </SignedOut>
      </div>
      {/* <ModeToggle /> */}
    </header>
  );
};

export default Header;
