import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrganization } from "@/actions/organization";
import OrgSwitcher from "@/components/org-switcher";
import ProjectList from "./_components/project-list";
import UserIssues from "./_components/user-issues";
import { Button } from "@/components/ui/button";
import { VideoIcon, FolderIcon, CalendarIcon } from "lucide-react";
import Link from "next/link";

export default async function OrganizationPage({ params }) {
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

    return (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 bg-neutral-900/70 mb-20 rounded-xl">
            <div className="absolute  left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-white/40 md:opacity-15 opacity-20 hidden md:block blur-3xl rounded-full pointer-events-none"></div>

            <header className="mb-4 flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 pt-20 pb-8 gap-4">
                <h1 className="text-3xl sm:text-4xl font-bold pb-2 text-center sm:text-left">
                    {organization.name}&rsquo;s Projects
                </h1>
                <OrgSwitcher />
            </header>

            {/* Navigation Tabs */}
            <div className="px-4 sm:px-8 mb-8">
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
                    <Button
                        variant="ghost"
                        className="border-b-2 border-lime-500 text-lime-600 rounded-none"
                    >
                        <FolderIcon className="w-4 h-4 mr-2" />
                        Projects
                    </Button>
                    <Link href={`/organization/${organization.id}/meetings`}>
                        <Button
                            variant="ghost"
                            className="rounded-none hover:border-b-2 hover:border-lime-500"
                        >
                            <VideoIcon className="w-4 h-4 mr-2" />
                            Meetings
                        </Button>
                    </Link>
                    <Link href={`/organization/${organization.id}/canvas`}>
                        <Button
                            variant="ghost"
                            className="rounded-none hover:border-b-2 hover:border-lime-500"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v1m0 0h6m-6 0V5a2 2 0 012-2h4a2 2 0 012 2v1m0 0h6M7 7v3a1 1 0 001 1h1m0 0v3a1 1 0 001 1h6a1 1 0 001-1v-3m0 0a1 1 0 001-1 1 1 0 00-1-1m-6 0h6" />
                            </svg>
                            Canvas
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col items-center gap-8 sm:gap-10 px-4 sm:px-0">
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
