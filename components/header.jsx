import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import UserMenu from "./ui/user-menu";
import SignInBtn from "./ui/signin-btn";

import { checkUser } from "@/lib/checkUser";
import Image from "next/image";

const Header = async () => {
    try {
        await checkUser();
    } catch (error) {
        console.error("Header checkUser error:", error.message);
    }

    return (
        <header className="flex justify-between items-center left-1/2 -translate-x-1/2 p-4 gap-3 bg-neutral-400 relative top-4 w-[min(768px,100%_-_2rem)] min-w-fit rounded-full bg-opacity-15 backdrop-blur-md shadow-lg border-white border border-opacity-10">
            <Link
                href="/"
                className="pl-2 flex gap-2 justify-center items-center"
            >
                <Image
                    src="/logo.png"
                    alt="Ascend Logo"
                    width={20}
                    height={20}
                    className="h-auto"
                    unoptimized
                />
                <h1 className="text-xl font-bold">
                    <span className="text-neutral-100">A</span>scend
                </h1>
            </Link>
            <div className="flex gap-2 justify-center items-center">
                {/* <Link href={"/project/create"}>
                    <Button
                        variant="default"
                        className="px-4 text-sm font-medium rounded-full items-center gap-1 md:flex bg-white text-black hover:bg-neutral-300 "
                    >
                        <PenBox size={20} className="font-semibold" />
                        <span className="text-sm font-semibold hidden md:block">
                            Create Project
                        </span>
                    </Button>
                </Link> */}
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
