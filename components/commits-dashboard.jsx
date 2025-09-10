"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    GitCommit,
    User,
    ExternalLink,
    FileText,
    RefreshCw,
    ChevronDown,
    Plus,
    Minus,
    Clock,
    Eye,
    Calendar,
    Mail,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CommitsDashboard = ({ projectId, repoUrl }) => {
    const [commits, setCommits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [generatingReport, setGeneratingReport] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [showModal, setShowModal] = useState(false);
    const [newRepoUrl, setNewRepoUrl] = useState("");
    const [dailySummaries, setDailySummaries] = useState([]);
    const [loadingSummaries, setLoadingSummaries] = useState(false);
    const [generatingSummary, setGeneratingSummary] = useState(false);
    const [selectedSummary, setSelectedSummary] = useState(null);
    const [sendingEmail, setSendingEmail] = useState(null);

    const fetchCommits = async (page = 1, refresh = false) => {
        try {
            if (refresh) setRefreshing(true);
            else setLoading(true);

            const response = await fetch(
                `/api/projects/${projectId}/commits?page=${page}&limit=10${
                    refresh ? "&refresh=true" : ""
                }`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                toast.error(data.error);
                return;
            }

            setCommits((prevCommits) =>
                page === 1 ? data.commits : [...prevCommits, ...data.commits]
            );
            setPagination(data.pagination);
        } catch (error) {
            console.error("Error fetching commits:", error);
            toast.error("Failed to fetch commits, please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const generateReport = async (commitId) => {
        try {
            setGeneratingReport(commitId);

            const response = await fetch(
                `/api/projects/${projectId}/commits/${commitId}`,
                { method: "POST" }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                toast.error(data.error);
                return;
            }

            setCommits((prevCommits) =>
                prevCommits.map((commit) =>
                    commit.id === commitId
                        ? {
                              ...commit,
                              report: data.report,
                              totalChanges:
                                  data.commit?.totalChanges ??
                                  commit.totalChanges,
                              additions:
                                  data.commit?.additions ?? commit.additions,
                              deletions:
                                  data.commit?.deletions ?? commit.deletions,
                          }
                        : commit
                )
            );

            setSelectedReport(data.report);
            toast.success(
                data.cached
                    ? "Report loaded from cache"
                    : "Report generated successfully!"
            );
        } catch (error) {
            console.error("Error generating report:", error);
            toast.error("Failed to generate report");
        } finally {
            setGeneratingReport(null);
        }
    };

    const handleAddRepoUrl = async () => {
        if (!newRepoUrl.trim()) {
            toast.error("Please enter a valid repository URL");
            return;
        }

        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    repoName: newRepoUrl,
                }),
            });

            const result = await response.json();

            if (result?.error) {
                toast.error(result.error);
                return;
            }

            toast.success("Repository URL added successfully!");
            setShowModal(false);
            setNewRepoUrl("");
            window.location.reload();
        } catch (error) {
            console.error("Error updating project:", error);
            toast.error(error.message || "Failed to add repository URL");
        }
    };

    const fetchDailySummaries = async () => {
        try {
            setLoadingSummaries(true);
            const response = await fetch(
                `/api/daily-summary?projectId=${projectId}`
            );
            if (response.ok) {
                const data = await response.json();
                setDailySummaries(data.summaries || []);
            }
        } catch (error) {
            console.error("Error fetching daily summaries:", error);
        } finally {
            setLoadingSummaries(false);
        }
    };

    const generateDailySummary = async (date) => {
        try {
            setGeneratingSummary(true);
            const response = await fetch("/api/daily-summary", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    projectId: projectId,
                    date: date,
                }),
            });

            const data = await response.json();

            if (data.error) {
                toast.error(data.error);
                return;
            }

            if (data.success && data.summary) {
                setSelectedSummary(data.summary);
                toast.success(
                    `Daily summary generated for ${data.commitsAnalyzed} commits`
                );
                fetchDailySummaries(); // Refresh the summaries list
            } else {
                toast.info(
                    data.message || "No commits found for the specified date"
                );
            }
        } catch (error) {
            console.error("Error generating daily summary:", error);
            toast.error("Failed to generate daily summary");
        } finally {
            setGeneratingSummary(false);
        }
    };

    const sendDailySummaryEmail = async (summaryId) => {
        try {
            setSendingEmail(summaryId);
            const response = await fetch("/api/send-daily-summary", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    projectId: projectId,
                    summaryId: summaryId,
                }),
            });

            const data = await response.json();

            if (data.error) {
                toast.error(data.error);
                return;
            }

            if (data.success) {
                toast.success(
                    `Daily summary sent to ${data.emailsSent} recipients`
                );
                fetchDailySummaries(); // Refresh to update email status
            }
        } catch (error) {
            console.error("Error sending daily summary email:", error);
            toast.error("Failed to send daily summary email");
        } finally {
            setSendingEmail(null);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 168) {
            return `${Math.floor(diffInHours / 24)}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const getImpactBadge = (commit) => {
        const changes = commit.totalChanges || 0;
        if (changes > 100)
            return { text: "High Impact", variant: "destructive" };
        if (changes > 50) return { text: "Medium Impact", variant: "warning" };
        return { text: "Low Impact", variant: "secondary" };
    };

    useEffect(() => {
        if (repoUrl) {
            fetchCommits();
            fetchDailySummaries();
        }
    }, [projectId, repoUrl]);

    if (!repoUrl) {
        return (
            <Card className="border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                        <GitCommit className="w-5 h-5" />
                        Repository Commits
                    </CardTitle>
                    <CardDescription className="text-neutral-600 dark:text-neutral-400">
                        No repository URL configured for this project
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={() => setShowModal(true)}
                        className="bg-lime-500 hover:bg-lime-600 text-black"
                    >
                        Add Repository URL
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                                <GitCommit className="w-5 h-5" />
                                Repository Commits
                            </CardTitle>
                            <CardDescription className="text-neutral-600 dark:text-neutral-400">
                                Track and analyze code changes in your
                                repository
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchCommits(1, true)}
                                disabled={refreshing}
                                className="border-neutral-300 dark:border-neutral-600"
                            >
                                <RefreshCw
                                    className={`w-4 h-4 mr-2 ${
                                        refreshing ? "animate-spin" : ""
                                    }`}
                                />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Daily Summaries Section */}
            <Card className="border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                                <FileText className="w-5 h-5" />
                                Daily Development Summaries
                            </CardTitle>
                            <CardDescription className="text-neutral-600 dark:text-neutral-400">
                                Automated daily reports of development activity
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    generateDailySummary(
                                        new Date().toISOString().split("T")[0]
                                    )
                                }
                                disabled={generatingSummary}
                                className="border-neutral-300 dark:border-neutral-600"
                            >
                                {generatingSummary ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Plus className="w-4 h-4 mr-2" />
                                )}
                                Generate Today&apos;s Summary
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loadingSummaries ? (
                        <div className="flex items-center justify-center py-4">
                            <RefreshCw className="w-4 h-4 animate-spin text-lime-500 mr-2" />
                            <span className="text-neutral-600 dark:text-neutral-400">
                                Loading summaries...
                            </span>
                        </div>
                    ) : dailySummaries.length === 0 ? (
                        <div className="text-center py-6">
                            <FileText className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                            <p className="text-neutral-600 dark:text-neutral-400">
                                No daily summaries available
                            </p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                                Daily summaries are automatically generated at 5
                                PM each day
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {dailySummaries.slice(0, 5).map((summary) => (
                                <div
                                    key={summary.id}
                                    className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="w-4 h-4 text-neutral-500" />
                                            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                                {new Date(
                                                    summary.date
                                                ).toLocaleDateString("en-US", {
                                                    weekday: "long",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                            {summary.emailSent && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    Email Sent
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                                            <span>
                                                {summary.commitsCount} commits
                                            </span>
                                            <span className="text-green-600">
                                                +{summary.totalAdditions || 0}
                                            </span>
                                            <span className="text-red-600">
                                                -{summary.totalDeletions || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setSelectedSummary(summary)
                                            }
                                            className="border-lime-300 text-lime-700 hover:bg-lime-50 dark:border-lime-600 dark:text-lime-400 dark:hover:bg-lime-950"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </Button>
                                        {!summary.emailSent && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    sendDailySummaryEmail(
                                                        summary.id
                                                    )
                                                }
                                                disabled={
                                                    sendingEmail === summary.id
                                                }
                                                className="border-neutral-300 dark:border-neutral-600"
                                            >
                                                {sendingEmail === summary.id ? (
                                                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                                ) : (
                                                    <Mail className="w-4 h-4 mr-1" />
                                                )}
                                                Send Email
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Commits List */}
            {loading ? (
                <Card className="border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-center space-x-2">
                            <RefreshCw className="w-5 h-5 animate-spin text-lime-500" />
                            <span className="text-neutral-600 dark:text-neutral-400">
                                Loading commits...
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ) : commits.length === 0 ? (
                <Card className="border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                        <GitCommit className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                            No commits found
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                            No commits have been fetched for this repository
                            yet.
                        </p>
                        <Button
                            onClick={() => fetchCommits(1, true)}
                            className="bg-lime-500 hover:bg-lime-600 text-black"
                        >
                            Fetch Commits
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {commits.map((commit) => (
                        <Card
                            key={commit.id}
                            className="border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-neutral-900/70 transition-colors"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <GitCommit className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                                            <h3 className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                                {commit.message.split("\n")[0]}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                                            <div className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {commit.author}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(commit.commitDate)}
                                            </div>
                                            <a
                                                href={commit.htmlUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-lime-600 hover:text-lime-700 dark:text-lime-400 dark:hover:text-lime-300"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                View on GitHub
                                            </a>
                                        </div>

                                        {commit.totalChanges && (
                                            <div className="flex items-center gap-3 text-xs">
                                                <span className="flex items-center gap-1">
                                                    <Plus className="w-3 h-3 text-green-500" />
                                                    {commit.additions}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Minus className="w-3 h-3 text-red-500" />
                                                    {commit.deletions}
                                                </span>
                                                <Badge
                                                    variant={
                                                        getImpactBadge(commit)
                                                            .variant
                                                    }
                                                    className="text-xs"
                                                >
                                                    {
                                                        getImpactBadge(commit)
                                                            .text
                                                    }
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {commit.report ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedReport(
                                                        commit.report
                                                    )
                                                }
                                                className="border-lime-300 text-lime-700 hover:bg-lime-50 dark:border-lime-600 dark:text-lime-400 dark:hover:bg-lime-950"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View Report
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    generateReport(commit.id)
                                                }
                                                disabled={
                                                    generatingReport ===
                                                    commit.id
                                                }
                                                className="border-neutral-300 dark:border-neutral-600"
                                            >
                                                {generatingReport ===
                                                commit.id ? (
                                                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                                ) : (
                                                    <FileText className="w-4 h-4 mr-1" />
                                                )}
                                                Generate Report
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Load More Button */}
                    {pagination.page < pagination.totalPages && (
                        <Card className="border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                            <CardContent className="p-4 text-center">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        fetchCommits(pagination.page + 1)
                                    }
                                    disabled={loading}
                                    className="border-neutral-300 dark:border-neutral-600"
                                >
                                    {loading ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 mr-2" />
                                    )}
                                    Load Previous Commits
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Report Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                        <CardHeader className="border-b border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-neutral-900 dark:text-neutral-100">
                                        Commit Analysis Report
                                    </CardTitle>
                                    <CardDescription className="text-neutral-600 dark:text-neutral-400">
                                        {
                                            selectedReport.commit?.message.split(
                                                "\n"
                                            )[0]
                                        }
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedReport(null)}
                                    className="border-neutral-300 dark:border-neutral-600"
                                >
                                    Close
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 overflow-y-auto">
                            <div className="prose prose-neutral dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {selectedReport.content ||
                                        selectedReport.summary}
                                </ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Daily Summary Modal */}
            {selectedSummary && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                        <CardHeader className="border-b border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-neutral-900 dark:text-neutral-100">
                                        Daily Development Summary
                                    </CardTitle>
                                    <CardDescription className="text-neutral-600 dark:text-neutral-400">
                                        {new Date(
                                            selectedSummary.date
                                        ).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}{" "}
                                        • {selectedSummary.commitsCount} commits
                                        analyzed
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!selectedSummary.emailSent && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                sendDailySummaryEmail(
                                                    selectedSummary.id
                                                )
                                            }
                                            disabled={
                                                sendingEmail ===
                                                selectedSummary.id
                                            }
                                            className="border-lime-300 text-lime-700 hover:bg-lime-50 dark:border-lime-600 dark:text-lime-400 dark:hover:bg-lime-950"
                                        >
                                            {sendingEmail ===
                                            selectedSummary.id ? (
                                                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                            ) : (
                                                <Mail className="w-4 h-4 mr-1" />
                                            )}
                                            Send Email
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedSummary(null)}
                                        className="border-neutral-300 dark:border-neutral-600"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 overflow-y-auto">
                            <div className="prose prose-neutral dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {selectedSummary.content}
                                </ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Add Repository Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                        <CardHeader>
                            <CardTitle className="text-neutral-900 dark:text-neutral-100">
                                Add Repository URL
                            </CardTitle>
                            <CardDescription className="text-neutral-600 dark:text-neutral-400">
                                Enter the GitHub repository URL to track commits
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <input
                                type="text"
                                value={newRepoUrl}
                                onChange={(e) => setNewRepoUrl(e.target.value)}
                                placeholder="https://github.com/username/repository"
                                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-lime-500"
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                    className="border-neutral-300 dark:border-neutral-600"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddRepoUrl}
                                    className="bg-lime-500 hover:bg-lime-600 text-black"
                                >
                                    Save
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default CommitsDashboard;
