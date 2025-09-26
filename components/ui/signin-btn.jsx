import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const SignInBtn = () => {
    return (
        <SignInButton>
            <Button className="font-semibold rounded-full text-sm bg-gradient-to-b from-lime-400 to-lime-600 border border-lime-600  items-center gap-1 shadow-sm text-black transition hover:shadow-md duration-700 ease-in-out delay-100 hover:from-lime-500 hover:to-lime-700">
                <LogIn size={20} className="font-bold" />
                Sign In
            </Button>
        </SignInButton>
    );
};

export default SignInBtn;
