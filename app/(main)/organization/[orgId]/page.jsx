import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrganization } from "@/actions/organization";
import OrgSwitcher from "@/components/org-switcher";

export default async function OrganizationPage({ params }) {
  const { orgId } = params;
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const organization = await getOrganization(orgId);

  if (!organization) {
    return <div>Organization not found</div>;
  }

  return (
    <div className="mx-auto px-4 w-full min-h-screen bg-neutral-900/80 mb-40 rounded-xl">
      <div className="absolute mt-[30rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-white/40 md:opacity-20 opacity-20 hidden md:block blur-3xl rounded-full pointer-events-none"></div>
      <header className="mb-4 flex justify-between items-center mt-40 p-16">
        <h1 className="text-4xl font-bold gradient-title pb-2">
          {organization.name}&rsquo;s Projects
        </h1>
        <OrgSwitcher />
      </header>
    </div>
  );
}
