import { SignInButton } from "@clerk/nextjs";
import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const SignInBtn = () => {
  return (
    <SignInButton>
      <Button className="px-4 py-1 h-12 mt-3 font-semibold rounded-full text-md">
        <LogIn size={20} className="font-bold" />
        Sign In
      </Button>
    </SignInButton>
  );
};

export default SignInBtn;
