"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Github, AlertCircle } from "lucide-react";
import { BarLoader } from "react-spinners";
import useFetch from "@/hooks/useFetch";
import { getGitHubIssues } from "@/actions/github-issues";
import GitHubIssueCard from "@/components/github-issue-card";

const GitHubIssuesSection = forwardRef(function GitHubIssuesSection({ projectId, onIssueSelect }, ref) {
    const {
        loading: issuesLoading,
        error: issuesError,
        fn: fetchGitHubIssues,
        data: githubData,
    } = useFetch(getGitHubIssues);

    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (projectId) {
            fetchGitHubIssues(projectId);
        }
    }, [projectId]);

    const handleRefresh = () => {
        fetchGitHubIssues(projectId);
    };

    const handleIssueClick = (githubIssue) => {
        if (githubIssue.isAlreadyImported) {
            return; // Do nothing if already imported
        }
        
        const issueData = {
            title: githubIssue.title,
            body: githubIssue.body,
            number: githubIssue.number,
            htmlUrl: githubIssue.htmlUrl,
            githubIssueNumber: githubIssue.number,
            githubIssueUrl: githubIssue.htmlUrl,
        };
        
        console.log('Passing GitHub issue data to onIssueSelect:', issueData);
        onIssueSelect(issueData);
    };

    useImperativeHandle(ref, () => ({
        refresh: handleRefresh
    }));

    const issues = githubData?.issues || [];
    const error = githubData?.error || issuesError?.message;

    return (
        <Card className="bg-neutral-800/30 border-neutral-700 space-y-4 mt-8">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
                        <Github className="h-5 w-5 text-neutral-400" />
                        GitHub Issues
                        {issues.length > 0 && (
                            <span className="text-sm font-normal text-neutral-400">
                                ({issues.length})
                            </span>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={issuesLoading}
                            className="text-neutral-400 hover:text-neutral-200"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    issuesLoading ? "animate-spin" : ""
                                }`}
                            />
                        </Button>
                        {issues.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-neutral-400 hover:text-neutral-200"
                            >
                                {isExpanded ? "Collapse" : "Expand"}
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {issuesLoading && <BarLoader width="100%" color="#84cc16" />}

                {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {!issuesLoading && !error && issues.length === 0 && (
                    <div className="text-center py-8">
                        <Github className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                        <p className="text-neutral-400 text-sm">
                            No open GitHub issues found
                        </p>
                        <p className="text-neutral-500 text-xs mt-1">
                            Issues will appear here when available in your
                            repository
                        </p>
                    </div>
                )}

                {!issuesLoading && !error && issues.length > 0 && (
                    <div className="space-y-4">
                        <p className="text-sm text-neutral-400">
                            Click on any issue to create it in your project with
                            pre-filled details. Issues already imported are marked with a green indicator.
                        </p>

                        <div className="grid gap-3">
                            {issues
                                .slice(0, isExpanded ? issues.length : 3)
                                .map((issue) => (
                                    <GitHubIssueCard
                                        key={issue.id}
                                        issue={issue}
                                        onClick={handleIssueClick}
                                    />
                                ))}
                        </div>

                        {!isExpanded && issues.length > 3 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsExpanded(true)}
                                className="w-full mt-3 border-neutral-600 text-neutral-300 hover:bg-neutral-700"
                            >
                                Show {issues.length - 3} more issues
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

export default GitHubIssuesSection;
