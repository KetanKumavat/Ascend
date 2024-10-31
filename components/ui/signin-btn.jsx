import { SignInButton } from "@clerk/nextjs";
import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const SignInBtn = () => {
  return (
    <SignInButton>
      <Button className="md:px-4 md:py-1 py-1 px-3 h-12 font-semibold rounded-full text-md hover:bg-lime-600 bg-lime-500">
        <LogIn size={20} className="font-bold" />
        Sign In
      </Button>
    </SignInButton>
  );
};

export default SignInBtn;
