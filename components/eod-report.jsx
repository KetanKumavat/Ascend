"use client";
import { useState, useEffect } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { getUsernameFromRepoUrl } from "@/lib/getUsername";
import { updateProject } from "@/actions/project";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

const EODReport = ({ repoUrl, projectId }) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState("");
  const [commits, setCommits] = useState([]);
  const [commitReport, setCommitReport] = useState("");
  const [showCommitReport, setShowCommitReport] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState("");

  const username = repoUrl ? getUsernameFromRepoUrl(repoUrl) : null;
  const repo = repoUrl ? new URL(repoUrl).pathname.split("/")[2] : null;

  useEffect(() => {
    if (!username || !repo) {
      setLoading(false);
      return;
    }

    const fetchSummaryReport = async () => {
      try {
        const response = await fetch(
          `/api/github/summary?username=${username}&repo=${repo}`
        );
        const data = await response.json();
        
        if (data.error) {
          toast.error(`Failed to fetch summary: ${data.error}`);
        } else {
          setReport(data.report);
        }
      } catch (error) {
        console.error("Error fetching summary report:", error);
        toast.error("Failed to fetch summary report. Please try again");
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryReport();
  }, [username, repo]);

  useEffect(() => {
    if (!username || !repo) return;

    const fetchCommits = async () => {
      try {
        const response = await fetch(
          `/api/github/commits?username=${username}&repo=${repo}`
        );
        const data = await response.json();
        
        if (data.error) {
          toast.error(`Failed to fetch commits: ${data.error}`);
        } else {
          setCommits(data);
        }
      } catch (error) {
        console.error("Error fetching commits:", error);
        toast.error("Failed to fetch commits. Please try again");
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, [username, repo]);

  const handleAddRepoUrl = async () => {
    if (!newRepoUrl.trim()) {
      toast.error("Please enter a valid repository URL");
      return;
    }

    try {
      const result = await updateProject({ id: projectId, repoName: newRepoUrl });
      
      // Check if the result contains an error
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
      
      // Handle different types of errors
      if (error.message.includes("admin") || error.message.includes("permission")) {
        toast.error("Only admins can add repository URLs");
      } else if (error.message.includes("invalid") || error.message.includes("url")) {
        toast.error("Invalid repository URL format");
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        toast.error("Network error. Please check your connection and try again");
      } else {
        toast.error(error.message || "Failed to add repository URL. Please try again");
      }
    }
  };

  const fetchCommitReport = async (sha) => {
    try {
      const response = await fetch(
        `/api/commits/${sha}?username=${username}&repo=${repo}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.text();
      
      if (data.includes("error") || data.includes("Error")) {
        toast.error("Failed to generate commit report");
      } else {
        setCommitReport(data);
        setShowCommitReport(true);
        toast.success("Commit report generated successfully!");
      }
    } catch (error) {
      console.error("Error fetching commit report:", error);
      toast.error("Failed to generate commit report. Please try again");
    }
  };

  return (
    <div className="eod-report mt-8 mx-auto p-8 bg-zinc-800/70 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-lime-400">
        End of Day (EOD) Report
      </h2>

      {loading ? (
        <div className="w-full h-full flex-col justify-center items-center">
          <ClipLoader color="#84cc16" size={50} />
          <p className="text-neutral-400 mt-4">Generating report...</p>
        </div>
      ) : (
        <div>
          {!repoUrl ? (
            <div className="text-neutral-400">
              <p>No repository URL provided.</p>
              <Button
                className="mt-4 px-4 py-2 text-sm font-medium bg-lime-400 hover:bg-lime-500 text-black rounded-lg"
                onClick={() => setShowModal(true)}>
                Add Repository URL
              </Button>
            </div>
          ) : (
            <div>
              <div className="summary-report p-6 bg-neutral-800/80 rounded-lg mb-6 shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-neutral-100">
                  Today&apos;s Summary
                </h3>
                <ReactMarkdown className="text-neutral-300">
                  {report}
                </ReactMarkdown>
              </div>

              {commits.length === 0 ? (
                <p className="text-neutral-400">No commits today.</p>
              ) : (
                <ul className="commit-list space-y-4">
                  {commits.map((commit) => (
                    <li
                      key={commit.sha}
                      className="commit-item p-4 bg-neutral-700/50 rounded-md shadow-lg hover:bg-neutral-800 transition">
                      <div className="commit-header flex justify-between items-center">
                        <h3 className="font-semibold text-lime-400 text-lg">
                          {commit.commit.message.replace(/#/g, "")}
                        </h3>
                        <p className="text-sm text-neutral-400">
                          {commit.commit.author.name}
                        </p>
                      </div>
                      <p className="text-sm text-neutral-500 mt-2">
                        {new Date(commit.commit.author.date).toLocaleString()}
                      </p>
                      <Button
                        onClick={() => fetchCommitReport(commit.sha)}
                        className="mt-4 px-5 py-2 text-sm font-medium bg-lime-400 hover:bg-lime-500 text-black rounded-lg shadow-sm focus:outline-none transition-all">
                        Generate Report
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {showCommitReport && commitReport && (
            <div className="commit-report mt-6 p-6 bg-neutral-800/80 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-semibold text-neutral-100">
                  Commit Report
                </h4>
                <Button
                  onClick={() => setShowCommitReport(false)}
                  className="px-2 py-1 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm">
                  Close
                </Button>
              </div>
              <ReactMarkdown
                className="text-neutral-300"
                remarkPlugins={[remarkGfm]}>
                {commitReport}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-black p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold text-white mb-4">
              Add Repository URL
            </h3>
            <input
              type="text"
              value={newRepoUrl}
              onChange={(e) => setNewRepoUrl(e.target.value)}
              placeholder="Enter repository URL"
              className="w-full p-2 border border-neutral-700 rounded-md bg-neutral-800 text-white focus:outline-none focus:border-lime-500"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded">
                Cancel
              </Button>
              <Button
                onClick={handleAddRepoUrl}
                className="bg-lime-400 hover:bg-lime-500 text-black px-4 py-2 rounded">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EODReport;
