"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, GitBranch, User, CheckCircle } from "lucide-react";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import Link from "next/link";

export default function GitHubIssueCard({ issue, onClick }) {
    console.log("GitHubIssueCard - issue:", issue);
    const created = formatDistanceToNow(new Date(issue.createdAt), {
        addSuffix: true,
    });

    return (
        <Card
            className={`hover:shadow-md transition-all cursor-pointer bg-neutral-800/40 border-neutral-700 hover:border-neutral-600 ${
                issue.isAlreadyImported
                    ? "opacity-60 ring-2 ring-green-500"
                    : ""
            }`}
            onClick={() => !issue.isAlreadyImported && onClick(issue)}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-medium text-neutral-100 leading-tight">
                        {issue.title}
                        {issue.isAlreadyImported && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-green-400">
                                <CheckCircle className="h-3 w-3" />
                                Already imported as: {issue.existingIssueTitle}
                            </div>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-xs text-neutral-400 shrink-0">
                        <GitBranch className="h-3 w-3" />#{issue.number}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
                {issue.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {issue.labels.slice(0, 3).map((label) => (
                            <Badge
                                key={label.name}
                                variant="outline"
                                className="text-xs px-2 py-0.5 border-0"
                                style={{
                                    backgroundColor: `#${label.color}20`,
                                    color: `#${label.color}`,
                                    border: `1px solid #${label.color}40`,
                                }}
                            >
                                {label.name}
                            </Badge>
                        ))}
                        {issue.labels.length > 3 && (
                            <Badge
                                variant="outline"
                                className="text-xs px-2 py-0.5 text-neutral-400"
                            >
                                +{issue.labels.length - 3}
                            </Badge>
                        )}
                    </div>
                )}
                {issue.body && (
                    <p
                        className="text-xs text-neutral-400 overflow-hidden text-ellipsis"
                        style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                        }}
                    >
                        {issue.body.length > 100
                            ? `${issue.body.substring(0, 100)}...`
                            : issue.body}
                    </p>
                )}

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        {issue.assignee && (
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-neutral-400" />
                                <span className="text-xs text-neutral-400">
                                    {issue.assignee.login}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">
                            {created}
                        </span>
                        <Link
                            href={issue.htmlUrl}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="h-3 w-3 text-neutral-500" />
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
