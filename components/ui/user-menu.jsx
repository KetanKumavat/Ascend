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
          avatarBox:
            "w-10 h-10 p-0 border-none focus:ring-0 focus:outline-none",
          userButtonPopoverMainContainer: {
            minWidth: "200px",
          },
          userButtonPopoverCustomItemButton: {
            backgroundColor: "#1f1f1f",
            padding: "1rem 1rem",
            minHeight: "40px",
          },
          userButtonPopoverActionButton: {
            backgroundColor: "#1f1f1f",
            padding: "1rem 1rem",
            minHeight: "40px",
          },
          menu: {
            padding: "0",
          },
          menuItem: {
            padding: "1rem 1rem",
          },
        },
      }}>
      <UserButton.MenuItems>
        <UserButton.Link
          label="MyOrganizations"
          href="/team-onboarding"
          labelIcon={<ChartNoAxesGantt size={16} />}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
};

export default UserMenu;
