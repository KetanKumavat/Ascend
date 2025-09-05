"use client";

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
              "border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors duration-200 text-sm font-medium",
            organizationSwitcherPopover:
              "bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-lg rounded-lg",
            organizationSwitcherItem:
              "px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors duration-200 text-sm",
            organizationSwitcherItemActive:
              "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100",
            organizationSwitcherItemIcon: "text-neutral-600 dark:text-neutral-400",
            organizationSwitcherItemText: "text-neutral-900 dark:text-neutral-100 text-sm",
            organizationSwitcherItemTextActive:
              "text-neutral-900 dark:text-neutral-100 font-medium",
            organizationPreviewMainIdentifier:
              "text-neutral-900 dark:text-neutral-100 font-medium text-sm truncate",
            organizationPreviewSecondaryIdentifier:
              "text-neutral-600 dark:text-neutral-400 text-xs",
            button: "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100",
            organizationSwitcherTriggerIcon: "text-neutral-600 dark:text-neutral-400",
            organizationSwitcherPopoverCard: "border-0 shadow-none",
            organizationSwitcherPopoverActions: "border-t border-neutral-200 dark:border-neutral-800 pt-2 mt-2",
            organizationSwitcherPopoverActionButton: "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 text-sm",
            organizationSwitcherPopoverActionButtonIcon: "text-neutral-500 dark:text-neutral-500",
          },
        }}
      />
    </SignedIn>
  );
};

export default OrgSwitcher;
