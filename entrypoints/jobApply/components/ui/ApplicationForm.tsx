import React, { useState } from "react";
import { Job_Application } from "../../../../utils/types";

interface ApplicationFormProps {
  application?: Job_Application;
  onSubmit: (application: Omit<Job_Application, "id">) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  application,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    url: application?.url || "",
    company: application?.company || "",
    position: application?.position || "",
    dateApplied:
      application?.dateApplied || new Date().toISOString().split("T")[0],
    status: application?.status || "applied",
    resumeVersion: application?.resumeVersion || "",
    notes: application?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
    }

    if (!formData.position.trim()) {
      newErrors.position = "Position title is required";
    }

    if (!formData.url.trim()) {
      newErrors.url = "Job URL is required";
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = "Please enter a valid URL";
    }

    if (!formData.dateApplied) {
      newErrors.dateApplied = "Application date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const statusOptions = [
    { value: "applied", label: "Applied" },
    { value: "interview", label: "Interview Scheduled" },
    { value: "offer", label: "Offer Received" },
    { value: "rejected", label: "Rejected" },
    { value: "pending", label: "Pending Response" },
  ];

  return (
    <div className="glass-card p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text">
            {isEdit ? "Edit Application" : "Add New Application"}
          </h2>
          <p className="text-gray-600 mt-1">
            {isEdit
              ? "Update your job application details"
              : "Track a new job application"}
          </p>
        </div>
        <div className="icon-container icon-lg gradient-bg-primary">
          <svg
            className="w-6 h-6 text-white"
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
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company */}
          <div className="form-group">
            <label htmlFor="company" className="form-label">
              Company *
            </label>
            <input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
              className={`form-input ${
                errors.company
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : ""
              }`}
              placeholder="e.g., Google, Microsoft, Startup Inc."
            />
            {errors.company && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {errors.company}
              </p>
            )}
          </div>

          {/* Position */}
          <div className="form-group">
            <label htmlFor="position" className="form-label">
              Position *
            </label>
            <input
              id="position"
              type="text"
              value={formData.position}
              onChange={(e) => handleChange("position", e.target.value)}
              className={`form-input ${
                errors.position
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : ""
              }`}
              placeholder="e.g., Software Engineer, Product Manager"
            />
            {errors.position && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {errors.position}
              </p>
            )}
          </div>
        </div>

        {/* Job URL */}
        <div className="form-group">
          <label htmlFor="url" className="form-label">
            Job Posting URL *
          </label>
          <input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => handleChange("url", e.target.value)}
            className={`form-input ${
              errors.url
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                : ""
            }`}
            placeholder="https://company.com/careers/job-posting"
          />
          {errors.url && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {errors.url}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Application Date */}
          <div className="form-group">
            <label htmlFor="dateApplied" className="form-label">
              Application Date *
            </label>
            <input
              id="dateApplied"
              type="date"
              value={formData.dateApplied}
              onChange={(e) => handleChange("dateApplied", e.target.value)}
              className={`form-input ${
                errors.dateApplied
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : ""
              }`}
            />
            {errors.dateApplied && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {errors.dateApplied}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="form-group">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="form-select"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Resume Version */}
          <div className="form-group">
            <label htmlFor="resumeVersion" className="form-label">
              Resume Version
            </label>
            <input
              id="resumeVersion"
              type="text"
              value={formData.resumeVersion}
              onChange={(e) => handleChange("resumeVersion", e.target.value)}
              className="form-input"
              placeholder="v2.1, Tech-focused, etc."
            />
          </div>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            className="form-textarea"
            rows={4}
            placeholder="Add any additional notes about this application..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {isEdit ? "Update Application" : "Save Application"}
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};
