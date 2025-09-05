import { Suspense } from "react";
import { getUserIssues } from "@/actions/organization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IssueCard from "@/components/issue-card";
import { AlertCircle } from "lucide-react";

export default async function UserIssues({ userId }) {
  const issues = await getUserIssues(userId);

  if (issues.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          No issues found
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          You don&apos;t have any issues assigned or reported yet
        </p>
      </div>
    );
  }

  const assignedIssues = issues.filter(
    (issue) => issue.assignee.clerkUserId === userId
  );
  const reportedIssues = issues.filter(
    (issue) => issue.reporter.clerkUserId === userId
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="assigned" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-neutral-100 dark:bg-neutral-800">
          <TabsTrigger 
            value="assigned"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900"
          >
            Assigned to You ({assignedIssues.length})
          </TabsTrigger>
          <TabsTrigger 
            value="reported"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900"
          >
            Reported by You ({reportedIssues.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="assigned" className="mt-6">
          <Suspense fallback={<IssueGridSkeleton />}>
            <IssueGrid issues={assignedIssues} emptyMessage="No issues assigned to you" />
          </Suspense>
        </TabsContent>
        <TabsContent value="reported" className="mt-6">
          <Suspense fallback={<IssueGridSkeleton />}>
            <IssueGrid issues={reportedIssues} emptyMessage="No issues reported by you" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IssueGrid({ issues, emptyMessage }) {
  if (issues.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-600 dark:text-neutral-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} showStatus />
      ))}
    </div>
  );
}

function IssueGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-full mb-2"></div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
