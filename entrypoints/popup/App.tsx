import "./App.css";
import { useEffect, useState } from "react";
import { storage } from "#imports";
import { JOBAPPLICATIONLIST } from "@/utils/storageName";
import { Job_Application } from "@/utils/types";

function App() {
  const [appliedJobsCount, setAppliedJobsCount] = useState(0);

  // Initialize popup data when component mounts
  useEffect(() => {
    const initializePopup = async () => {
      console.log("Popup initialized - loading job applications count");

      try {
        const jobApplications = (await storage.getItem(
          `local:${JOBAPPLICATIONLIST}`
        )) as Job_Application[] | undefined;

        if (jobApplications) {
          setAppliedJobsCount(jobApplications.length);
          console.log(`Loaded ${jobApplications.length} job applications`);
        } else {
          setAppliedJobsCount(0);
          console.log("No job applications found");
        }
      } catch (error) {
        console.error("Error loading job applications:", error);
        setAppliedJobsCount(0);
      }
    };

    initializePopup();
  }, []);

  const handleViewAppliedJobs = async () => {
    try {
      // Open the job applications page in a new tab
      const tabs = await browser.tabs.create({
        url: browser.runtime.getURL("/jobApply.html"),
      });
      // Close the popup after navigation
      window.close();
    } catch (error) {
      console.error("Error opening job applications page:", error);
      // Fallback: try to open in current tab
      window.location.href = "/jobApply.html";
    }
  };

  const handleSettings = () => {
    // For now, just show an alert - settings page can be implemented later
    alert("Settings page coming soon!");
  };

  return (
    <div className="w-80 min-h-96 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100 to-cyan-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Job Logger
          </h1>
          <p className="text-sm text-gray-600 font-medium mb-4">
            Your Career Companion
          </p>

          {/* Job Counter Display */}
          <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl px-4 py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 12l2 2 4-4"
                  />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900 leading-none">
                  {appliedJobsCount}
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Jobs Applied
                </div>
              </div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-xs text-gray-500 font-medium">This Week</div>
              <div className="text-lg font-bold text-blue-600">0</div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="space-y-3">
          {/* Primary Button - View Applied Jobs */}
          <button
            onClick={handleViewAppliedJobs}
            className="group w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-semibold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:ring-offset-2 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              <svg
                className="w-5 h-5 transition-transform group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span>View Applied Jobs</span>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>

          {/* Secondary Button - Settings */}
          <button
            onClick={handleSettings}
            className="group w-full bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200/60 hover:border-gray-300/80 text-gray-700 hover:text-gray-900 font-medium py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-gray-400/20 focus:ring-offset-2"
          >
            <div className="flex items-center justify-center gap-3">
              <svg
                className="w-5 h-5 transition-transform group-hover:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Settings</span>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200/50">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium">
              Track your applications efficiently
            </span>
          </div>
          <div className="flex items-center justify-center mt-3 gap-4">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Secure</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Fast</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
