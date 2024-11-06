"use client";
import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";

export default function GitHubUsernameModal({ isOpen, onClose }) {
  const [username, setUsername] = useState("");

  const handleSubmit = () => {
    console.log(username);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <Dialog.Panel className="bg-neutral-800 text-white rounded-xl p-8 w-96">
          <Dialog.Title className="text-2xl font-bold">
            Enter GitHub Username
          </Dialog.Title>
          <Dialog.Description className="text-sm mt-2 mb-4">
            Please provide your GitHub username so we can link your account to
            your projects and contributions.
          </Dialog.Description>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="GitHub Username"
            className="w-full p-2 mb-4 bg-neutral-700 border border-neutral-600 rounded text-white"
          />
          <div className="flex justify-end gap-4">
            <button className="text-lime-500" onClick={onClose}>
              Cancel
            </button>
            <button className="text-lime-500" onClick={handleSubmit}>
              Save
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
