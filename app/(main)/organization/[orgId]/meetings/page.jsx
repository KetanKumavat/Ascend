import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrganization } from "@/actions/organization";
import { getProjects } from "@/actions/project";
import { MeetingsDashboard } from "@/components/meetings-dashboard";
import OrgSwitcher from "@/components/org-switcher";
import { Button } from "@/components/ui/button";
import { VideoIcon, FolderIcon } from "lucide-react";
import Link from "next/link";

export default async function MeetingsPage({ params }) {
  const { orgId } = await params;
  const auth_result = await auth();
  const { userId } = auth_result;

  if (!userId) {
    redirect("/sign-in");
  }

  const organization = await getOrganization(orgId);

  if (!organization) {
    return <div>Organization not found</div>;
  }

  // Get projects for the meeting creation dialog
  const projects = await getProjects(orgId);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 bg-neutral-900/70 mb-20 rounded-xl">
      <div className="absolute mt-[30rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-white/40 md:opacity-15 opacity-20 hidden md:block blur-3xl rounded-full pointer-events-none"></div>

      <header className="mb-8 flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 mt-36 sm:mt-40 py-8 sm:py-16 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold pb-2 text-center sm:text-left">
            Team Meetings
          </h1>
          <p className="text-muted-foreground text-center sm:text-left">
            {organization.name} • Collaborate and stay aligned
          </p>
        </div>
        <OrgSwitcher />
      </header>

      {/* Navigation Tabs */}
      <div className="px-4 sm:px-8 mb-8">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
          <Link href={`/organization/${organization.id}`}>
            <Button variant="ghost" className="rounded-none hover:border-b-2 hover:border-lime-500">
              <FolderIcon className="w-4 h-4 mr-2" />
              Projects
            </Button>
          </Link>
          <Button variant="ghost" className="border-b-2 border-lime-500 text-lime-600 rounded-none">
            <VideoIcon className="w-4 h-4 mr-2" />
            Meetings
          </Button>
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-8">
        <MeetingsDashboard projects={projects} />
      </div>
    </div>
  );
}
