"use client";
import React, { useState, useEffect } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

const EODReport = ({ username, repo }) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState("");
  const [commits, setCommits] = useState([]);
  const [commitReport, setCommitReport] = useState("");

  useEffect(() => {
    const fetchSummaryReport = async () => {
      try {
        const response = await fetch(
          `/api/github/summary?username=${username}&repo=${repo}`
        );
        const data = await response.json();
        if (data.error) {
          console.error(data.error);
        } else {
          setReport(data.report);
        }
      } catch (error) {
        console.error("Error fetching summary report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryReport();
  }, [username, repo]);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const response = await fetch(
          `/api/github/commits?username=${username}&repo=${repo}`
        );
        const data = await response.json();
        if (data.error) {
          console.error(data.error);
        } else {
          setCommits(data);
        }
      } catch (error) {
        console.error("Error fetching commits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, [username, repo]);

  const fetchCommitReport = async (sha) => {
    try {
      const response = await fetch(
        `/api/commits/${sha}?username=${username}&repo=${repo}`
      );
      const data = await response.text();
      setCommitReport(data);
    } catch (error) {
      console.error("Error fetching commit report:", error);
    }
  };

  return (
    <div className="eod-report mt-8 p-8 bg-zinc-800/70 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-lime-400">
        End of Day (EOD) Report
      </h2>

      {loading ? (
        <div className="w-full h-full flex-col justify-center items-center">
          <ClipLoader color="#84cc16" size={50} />
          <p className="text-neutral-400 mt-4">Fetching report...</p>
        </div>
      ) : (
        <div>
          <div className="summary-report p-6 bg-neutral-800/80 rounded-lg mb-6 shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-neutral-100">
              Today&apos;s Summary
            </h3>
            <ReactMarkdown className="text-neutral-300">{report}</ReactMarkdown>
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

      {commitReport && (
        <div className="commit-report mt-6 p-6 bg-neutral-800/80 rounded-lg shadow-md">
          <h4 className="text-xl font-semibold text-neutral-100 mb-4">
            Commit Report
          </h4>
          <ReactMarkdown className="text-neutral-300">
            {commitReport}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default EODReport;
