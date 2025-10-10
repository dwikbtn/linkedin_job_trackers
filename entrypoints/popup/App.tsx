import "./App.css";
import { useEffect, useState } from "react";
import { storage } from "#imports";
import { JOBAPPLICATIONLIST } from "@/utils/storageName";
import { Job_Application } from "@/utils/types";
import { isDateInCurrentWeek } from "@/utils/utils";
import { sendMessage } from "@/utils/messaging";

function App() {
  const [appliedJobsCount, setAppliedJobsCount] = useState(0);
  const [thisWeekCount, setThisWeekCount] = useState(0);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showSmartCaptureModal, setShowSmartCaptureModal] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({
    company: "",
    position: "",
    url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to refresh counts (extracted for reusability)
  const refreshCounts = async () => {
    try {
      const jobApplications = (await storage.getItem(
        `local:${JOBAPPLICATIONLIST}`
      )) as Job_Application[] | undefined;

      if (jobApplications) {
        setAppliedJobsCount(jobApplications.length);

        // Calculate applications from this week
        const thisWeekApplications = jobApplications.filter((job) =>
          isDateInCurrentWeek(job.dateApplied)
        );
        setThisWeekCount(thisWeekApplications.length);

        console.log(`Loaded ${jobApplications.length} job applications`);
        console.log(
          `${thisWeekApplications.length} applications applied this week`
        );
      } else {
        setAppliedJobsCount(0);
        setThisWeekCount(0);
        console.log("No job applications found");
      }
    } catch (error) {
      console.error("Error loading job applications:", error);
      setAppliedJobsCount(0);
      setThisWeekCount(0);
    }
  };

  // Quick add application function
  const handleQuickAdd = async () => {
    if (!quickAddForm.company.trim() || !quickAddForm.position.trim()) {
      alert("Please fill in at least Company and Position fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get existing applications
      const existingApplications =
        ((await storage.getItem(`local:${JOBAPPLICATIONLIST}`)) as
          | Job_Application[]
          | undefined) || [];

      // Create new application
      const newApplication: Job_Application = {
        id: Date.now().toString(), // Simple ID generation
        company: quickAddForm.company.trim(),
        position: quickAddForm.position.trim(),
        url: quickAddForm.url.trim() || "",
        dateApplied: new Date().toISOString(),
        status: "Applied",
        notes: "Added via quick add",
      };

      // Add to existing applications
      const updatedApplications = [...existingApplications, newApplication];

      // Save to storage
      await storage.setItem(`local:${JOBAPPLICATIONLIST}`, updatedApplications);

      // Reset form and close
      setQuickAddForm({ company: "", position: "", url: "" });
      setShowQuickAdd(false);

      // Refresh counts
      await refreshCounts();

      console.log("Application added successfully:", newApplication);
    } catch (error) {
      console.error("Error adding application:", error);
      alert("Failed to add application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize popup data when component mounts
  useEffect(() => {
    const initializePopup = async () => {
      console.log("Popup initialized - loading job applications count");
      await refreshCounts();
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

  async function handleStartSmartCapture() {
    const tabId = (
      await browser.tabs.query({ active: true, currentWindow: true })
    )[0].id;
    if (tabId === undefined) {
      alert("Could not determine the active tab. Please try again.");
      return;
    }
    try {
      await sendMessage("startSmartCapture", undefined, tabId);
      // Close the popup after starting smart capture
      window.close();
    } catch (error) {
      console.error("Error starting Smart Capture:", error);
      alert("Failed to start Smart Capture. Please try again.");
    }
  }

  return (
    <div className="w-80 min-h-96 bg-stone-50 relative">
      {/* Subtle geometric background decoration */}
      <div className="absolute top-4 right-4 w-20 h-20 bg-stone-100 transform rotate-12 rounded-lg opacity-50"></div>
      <div className="absolute bottom-6 left-6 w-12 h-12 bg-amber-50 rounded-full"></div>
      <div className="absolute top-1/2 right-8 w-3 h-3 bg-amber-200 rounded-full"></div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-3xl mb-4 shadow-sm border border-amber-200">
            {/* Custom briefcase icon */}
            <svg
              className="w-8 h-8 text-amber-800"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M10 2h4a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2zM8 6h8V4h-4v2zm-2 4v2h12v-2H6z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-1">
            Career Tracker
          </h1>
          <p className="text-sm text-stone-600 font-medium mb-6">
            Manage your job applications effortlessly.
          </p>

          {/* Job Counter Display */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center border border-amber-200">
                  {/* Custom checkmark icon */}
                  <svg
                    className="w-5 h-5 text-amber-700"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-stone-800">
                    {appliedJobsCount}
                  </div>
                  <div className="text-xs text-stone-600 font-medium">
                    Applications Tracked
                  </div>
                </div>
              </div>
              <div className="text-center bg-stone-50 px-3 py-2 rounded-xl">
                <div className="text-xs text-stone-500 font-medium">
                  This Week
                </div>
                <div className="text-lg font-bold text-stone-700">
                  {thisWeekCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Section */}
        {!showQuickAdd ? (
          <div className="mb-6">
            <button
              onClick={() => setShowQuickAdd(true)}
              className="group w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ease-out focus:outline-none focus:ring-3 focus:ring-emerald-300"
            >
              <div className="flex items-center justify-center gap-2">
                {/* Custom plus icon */}
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Quick Add Application</span>
              </div>
            </button>
          </div>
        ) : (
          <div className="mb-6 bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-stone-800">
                Quick Add Application
              </h3>
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  setQuickAddForm({ company: "", position: "", url: "" });
                }}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Company Name *"
                  value={quickAddForm.company}
                  onChange={(e) =>
                    setQuickAddForm({
                      ...quickAddForm,
                      company: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Position Title *"
                  value={quickAddForm.position}
                  onChange={(e) =>
                    setQuickAddForm({
                      ...quickAddForm,
                      position: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                />
              </div>

              <div>
                <input
                  type="url"
                  placeholder="Job URL (optional)"
                  value={quickAddForm.url}
                  onChange={(e) =>
                    setQuickAddForm({ ...quickAddForm, url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleQuickAdd}
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  {isSubmitting ? "Adding..." : "Add Application"}
                </button>
                <button
                  onClick={() => {
                    setShowQuickAdd(false);
                    setQuickAddForm({ company: "", position: "", url: "" });
                  }}
                  className="px-4 py-2 border border-stone-200 text-stone-600 text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Actions */}
        <div className="space-y-3">
          {/* Smart Capture Button */}
          <button
            onClick={() => handleStartSmartCapture()}
            className="group w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 ease-out focus:outline-none focus:ring-3 focus:ring-purple-300 relative"
          >
            <div className="flex items-center justify-center gap-3">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122"
                ></path>
              </svg>
              <span>Smart Capture</span>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </button>

          {/* Primary Button - View Applied Jobs */}
          <button
            onClick={handleViewAppliedJobs}
            className="group w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 ease-out focus:outline-none focus:ring-3 focus:ring-amber-300 relative"
          >
            <div className="flex items-center justify-center gap-3">
              {/* Custom folder icon */}
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM4 8v8h12V8H4z" />
              </svg>
              <span>View Applications</span>
              {/* Custom arrow icon */}
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </button>

          {/* Secondary Button - Settings */}
          <button
            onClick={handleSettings}
            className="group w-full bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-300 text-stone-700 hover:text-stone-800 font-medium py-3.5 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 ease-out focus:outline-none focus:ring-3 focus:ring-stone-200"
          >
            <div className="flex items-center justify-center gap-3">
              {/* Custom settings/gear icon */}
              <svg
                className="w-5 h-5 transition-transform group-hover:rotate-45"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Settings</span>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <div className="flex items-center justify-center gap-2 text-xs text-stone-600">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="font-medium">
              No chaos. Just clean career tracking.
            </span>
          </div>
          <div className="flex items-center justify-center mt-3 gap-4">
            <div className="flex items-center gap-1 text-xs text-stone-500">
              {/* Custom shield icon */}
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Secure</span>
            </div>
            <div className="w-1 h-1 bg-stone-300 rounded-full"></div>
            <div className="flex items-center gap-1 text-xs text-stone-500">
              {/* Custom lightning bolt icon */}
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Efficient</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
