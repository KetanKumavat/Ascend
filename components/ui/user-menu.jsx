"use client";

import { UserButton } from "@clerk/nextjs";
import { ChartNoAxesGantt } from "lucide-react";
import React from "react";

const UserMenu = () => {
  return (
    <UserButton
      className="mt-1 focus-visible:border-none focus:outline-none focus:ring-0"
      appearance={{
        elements: {
          avatarBox: "w-10 h-10",
          button: "bg-transparent border-none",
        },
      }}>
      <UserButton.MenuItems className="space-y-2">
        <UserButton.Link
          label="My Organizations"
          href="/team-onboarding"
          labelIcon={<ChartNoAxesGantt size={16} />}
          className="py-2 mt-4"
        />
        <UserButton.Action label="manageAccount" />
      </UserButton.MenuItems>
    </UserButton>
  );
};

export default UserMenu;
