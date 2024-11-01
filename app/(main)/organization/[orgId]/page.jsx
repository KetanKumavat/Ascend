import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrganization } from "@/actions/organization";
import OrgSwitcher from "@/components/org-switcher";
import ProjectList from "./_components/project-list";
import UserIssues from "./_components/user-issues";

export default async function OrganizationPage({ params }) {
  const { orgId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const organization = await getOrganization(orgId);

  if (!organization) {
    return <div>Organization not found</div>;
  }

  return (
    <div className="mx-auto w-[90%] px-4 md:w-full min-h-screen bg-neutral-900/70 mb-52 rounded-xl ">
      <div className="absolute mt-[30rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-white/40 md:opacity-15 opacity-20 hidden md:block blur-3xl rounded-full pointer-events-none"></div>
      <header className="mb-4 flex justify-between items-center mt-40 p-16 gap-6">
        <h1 className="text-4xl font-bold pb-2">
          {organization.name}&rsquo;s Projects
        </h1>
        <OrgSwitcher />
      </header>
      <div className="flex flex-col items-center gap-10">
        {/* Projects List */}
        <div className="w-full max-w-4xl">
          <ProjectList orgId={organization.id} />
        </div>

        {/* User Issues */}
        <div className="w-full max-w-4xl">
          <UserIssues userId={userId} />
        </div>
      </div>
    </div>
  );
}
