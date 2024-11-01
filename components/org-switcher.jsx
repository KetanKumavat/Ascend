"use client";

import React from "react";
import {
  useUser,
  useOrganization,
  SignedIn,
  OrganizationSwitcher,
} from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const OrgSwitcher = () => {
  const { isLoaded } = useOrganization();
  const { isLoaded: isUserLoaded } = useUser();
  const pathname = usePathname();

  if (!isLoaded || !isUserLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <SignedIn>
      <OrganizationSwitcher
        hidePersonal
        afterLeaveOrganizationUrl="/organization/:slug"
        afterSelectOrganizationUrl={`/organization/:slug`}
        createOrganizationMode={
          pathname === "/onboarding" ? "navigation" : "modal"
        }
        createOrganizationUrl={"/onboarding"}
        appearance={{
          elements: {
            organizationSwitcherTrigger:
              "border-2 border-neutral-500 rounded-md px-4 py-2 bg-neutral-900 text-white hover:bg-lime-500 hover:text-black transition-all duration-300 font-semibold text-lg",
            organizationSwitcherPopover:
              "bg-neutral-900 text-white border border-neutral-700 shadow-lg rounded-md hover:text-black",
            organizationSwitcherItem:
              "px-4 py-2 hover:bg-neutral-700 transition-all duration-300 font-semibold text-lg hover:text-black",
            organizationSwitcherItemActive:
              "bg-lime-500 text-black font-semibold text-lg",
            organizationSwitcherItemIcon: "text-lime-500",
            organizationSwitcherItemText: "text-white font-semibold text-lg",
            organizationSwitcherItemTextActive:
              "text-black font-semibold text-lg hover:text-black",
            organizationPreviewMainIdentifier:
              " font-semibold text-xl truncate hover:text-black",
            button: "hover:text-black",
          },
        }}
      />
    </SignedIn>
  );
};

export default OrgSwitcher;
