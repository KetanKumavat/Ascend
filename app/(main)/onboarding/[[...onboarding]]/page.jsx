"use client";

import { OrganizationList, useOrganization } from "@clerk/nextjs";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const Onboarding = () => {
  const { organization } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    if (organization) {
      router.push(`/organization/${organization.slug}`);
    }
  }, [organization]);

  return (
    <div className="flex justify-center items-center pt-14">
      <OrganizationList
        hidePersonal
        afterLeaveOrganizationUrl="/organization/:slug"
        afterSelectOrganizationUrl={`/organization/:slug`}
      />
    </div>
  );
};

export default Onboarding;
