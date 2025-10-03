import React, { useState, useEffect } from "react";
import { Job_Application } from "../../../utils/types";
import { sendMessage } from "../../../utils/messaging";
import { ApplicationList } from "./ApplicationList";
import { ApplicationForm } from "./ui/ApplicationForm";
import Loading from "./ui/Loading";
import Error from "./ui/Error";

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

  const handleCancelForm = () => {
    setCurrentView("list");
    setEditingApplication(null);
  };

  const getHeaderInfo = () => {
    const totalCount = applications.length;
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalCount, statusCounts };
  };

  const { totalCount, statusCounts } = getHeaderInfo();

  if (loading) {
    <Loading />;
  }

  return (
    <div className="container-main">
      {/* Background decoration - matching popup style */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100 to-cyan-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>

      <div className="container-content">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="icon-container icon-lg gradient-bg-primary">
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
            <div>
              <h1 className="page-title">Job Applications</h1>
              <p className="page-subtitle">
                Track and manage your job applications
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {totalCount}
              </div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {statusCounts.applied || 0}
              </div>
              <div className="text-sm text-gray-600">Applied</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {statusCounts.interview || 0}
              </div>
              <div className="text-sm text-gray-600">Interviews</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {statusCounts.offer || 0}
              </div>
              <div className="text-sm text-gray-600">Offers</div>
            </div>
          </div>

          {/* Action Bar */}
          {currentView === "list" && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setCurrentView("add")}
                className="btn-primary"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add New Application
                </div>
              </button>

              <button onClick={loadApplications} className="btn-secondary">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
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
            onEdit={handleEditClick}
            onDelete={handleDeleteApplication}
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
