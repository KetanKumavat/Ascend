import React from "react";
// import ModeToggle from "@/components/theme-toggler";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 bg-neutral-100 dark:bg-neutral-800 w-full">
      <Link href="/">
        <h1 className="text-2xl font-bold">Ascend</h1>
      </Link>
      <div>
        {/* <p>Elevate your team's productivity with Ascend</p> */}
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton className="px-4 py-2 hover:bg-black/30 bg-black text-white rounded" />
        </SignedOut>
      </div>
      {/* <ModeToggle /> */}
    </header>
  );
};

export default Header;
