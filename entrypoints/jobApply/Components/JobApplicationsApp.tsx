import React, { useState, useEffect } from "react";
import { Job_Application } from "../../../utils/types";
import { sendMessage } from "../../../utils/messaging";
import { ApplicationList } from "./ApplicationList";
import { ApplicationForm } from "../../../components/ApplicationForm";
import Loading from "../../../components/Loading";
import Error from "../../../components/Error";

type ViewState = "list" | "add" | "edit";

export const JobApplicationsApp: React.FC = () => {
  const [applications, setApplications] = useState<Job_Application[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>("list");
  const [editingApplication, setEditingApplication] =
    useState<Job_Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load applications on component mount
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading applications...");
      const apps = await sendMessage("getApplications");

      console.log("Loaded applications:", apps);
      setApplications(apps);

      // // For development/testing - add a sample application if no data exists
      // if (!apps ) {
      //   const testApplication: Job_Application = {
      //     id: "test-app-" + Date.now(),
      //     url: "https://jobs.google.com/jobs/software-engineer-frontend",
      //     company: "Google",
      //     position: "Senior Frontend Engineer",
      //     dateApplied: "2025-10-01",
      //     status: "applied",
      //     resumeVersion: "Tech-focused v2.1",
      //     notes:
      //       "Applied through referral from John Doe. Really excited about this opportunity to work on Google Search frontend. The role involves React, TypeScript, and modern web technologies.",
      //   };
      //   setApplications([testApplication]);
      // } else {
      //   setApplications(apps);
      // }
    } catch (err) {
      console.error("Failed to load applications:", err);
      setError("Failed to load applications. Please try again.");
      // Even on error, show test data for development
      // const testApplication: Job_Application = {
      //   id: "test-app-" + Date.now(),
      //   url: "https://jobs.google.com/jobs/software-engineer-frontend",
      //   company: "Google",
      //   position: "Senior Frontend Engineer",
      //   dateApplied: "2025-10-01",
      //   status: "applied",
      //   resumeVersion: "Tech-focused v2.1",
      //   notes:
      //     "Applied through referral from John Doe. Really excited about this opportunity to work on Google Search frontend. The role involves React, TypeScript, and modern web technologies.",
      // };
      // setApplications([testApplication]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddApplication = async (
    applicationData: Omit<Job_Application, "id">
  ) => {
    try {
      const newApplication: Job_Application = {
        ...applicationData,
        id: Date.now().toString(), // Simple ID generation for now
      };

      // Send to background script to save
      await sendMessage("saveApplication", newApplication);

      // Update local state
      setApplications((prev) => [newApplication, ...prev]);
      setCurrentView("list");
    } catch (err) {
      console.error("Failed to save application:", err);
      setError("Failed to save application. Please try again.");
    }
  };

  const handleEditApplication = async (
    applicationData: Omit<Job_Application, "id">
  ) => {
    if (!editingApplication) return;

    try {
      const updatedApplication: Job_Application = {
        ...applicationData,
        id: editingApplication.id,
      };

      // Update in storage
      await sendMessage("updateApplication", updatedApplication);

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === editingApplication.id ? updatedApplication : app
        )
      );

      setCurrentView("list");
      setEditingApplication(null);
    } catch (err) {
      console.error("Failed to update application:", err);
      setError("Failed to update application. Please try again.");
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      await sendMessage("deleteApplication", id);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err) {
      console.error("Failed to delete application:", err);
      setError("Failed to delete application. Please try again.");
    }
  };

  const handleEditClick = (application: Job_Application) => {
    setEditingApplication(application);
    setCurrentView("edit");
  };

  const handleUpdateApplication = async (application: Job_Application) => {
    try {
      // Update in storage
      await sendMessage("updateApplication", application);

      // Update local state
      setApplications((prev) =>
        prev.map((app) => (app.id === application.id ? application : app))
      );
    } catch (err) {
      console.error("Failed to update application:", err);
      setError("Failed to update application. Please try again.");
    }
  };

  const handleCancelForm = () => {
    setCurrentView("list");
    setEditingApplication(null);
  };

  const getHeaderInfo = () => {
    const totalCount = applications.length;
    const statusCounts = applications.reduce((acc, app) => {
      const status = app.status.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalCount, statusCounts };
  };

  const { totalCount, statusCounts } = getHeaderInfo();

  console.log(statusCounts);

  if (loading) {
    <Loading />;
  }

  return (
    <div className="min-h-screen bg-stone-50 relative">
      {/* Subtle geometric background decoration matching popup */}
      <div className="absolute top-8 right-8 w-24 h-24 bg-stone-100 transform rotate-12 rounded-lg opacity-40"></div>
      <div className="absolute bottom-12 left-12 w-16 h-16 bg-amber-50 rounded-full opacity-60"></div>
      <div className="absolute top-1/3 right-16 w-4 h-4 bg-amber-200 rounded-full"></div>
      <div className="absolute bottom-1/4 left-20 w-6 h-6 bg-stone-200 transform rotate-45"></div>

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-3xl shadow-sm border border-amber-200">
              {/* Custom briefcase icon matching popup */}
              <svg
                className="w-8 h-8 text-amber-800"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 2h4a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2zM8 6h8V4h-4v2zm-2 4v2h12v-2H6z" />
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-stone-800 mb-1">
                Application Manager
              </h1>
              <p className="text-stone-600 font-medium">
                Professional career tracking dashboard
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-stone-800">
                {totalCount}
              </div>
              <div className="text-sm text-stone-600 font-medium">
                Total Applications
              </div>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-amber-700">
                {statusCounts.applied || 0}
              </div>
              <div className="text-sm text-stone-600 font-medium">Applied</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-orange-600">
                {statusCounts.interview || 0}
              </div>
              <div className="text-sm text-stone-600 font-medium">
                Interviews
              </div>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-emerald-600">
                {statusCounts.offer || 0}
              </div>
              <div className="text-sm text-stone-600 font-medium">Offers</div>
            </div>
          </div>

          {/* Action Bar */}
          {currentView === "list" && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setCurrentView("add")}
                className="bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 ease-out focus:outline-none focus:ring-3 focus:ring-amber-300"
              >
                <div className="flex items-center gap-2">
                  {/* Custom plus icon */}
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add New Application
                </div>
              </button>

              <button
                onClick={loadApplications}
                className="bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-300 text-stone-700 hover:text-stone-800 font-medium py-3 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 ease-out focus:outline-none focus:ring-3 focus:ring-stone-200"
              >
                <div className="flex items-center gap-2">
                  {/* Custom refresh icon */}
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Refresh
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && <Error error={error} setError={setError} />}

        {/* Main Content */}
        {currentView === "list" && (
          <ApplicationList
            applications={applications}
            onEdit={handleUpdateApplication}
            onDelete={handleDeleteApplication}
            onAdd={handleAddApplication}
            onViewDetails={handleEditClick}
          />
        )}

        {currentView === "add" && (
          <ApplicationForm
            onSubmit={handleAddApplication}
            onCancel={handleCancelForm}
            isEdit={false}
          />
        )}

        {currentView === "edit" && editingApplication && (
          <ApplicationForm
            application={editingApplication}
            onSubmit={handleEditApplication}
            onCancel={handleCancelForm}
            isEdit={true}
          />
        )}
      </div>
    </div>
  );
};
