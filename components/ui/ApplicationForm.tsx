import React, { useState } from "react";
import { Job_Application } from "@/utils/types";

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
    <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-2xl mx-auto shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">
            {isEdit ? "Edit Application" : "Add New Application"}
          </h2>
          <p className="text-stone-600 mt-1">
            {isEdit
              ? "Update your job application details"
              : "Track a new job application"}
          </p>
        </div>
        <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-2xl border border-amber-200">
          {/* Custom plus/edit icon */}
          <svg
            className="w-6 h-6 text-amber-800"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            {isEdit ? (
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            ) : (
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            )}
          </svg>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company */}
          <div className="space-y-2">
            <label
              htmlFor="company"
              className="block text-sm font-medium text-stone-700"
            >
              Company *
            </label>
            <input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:ring-3 focus:ring-amber-200 transition-colors ${
                errors.company
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : "border-stone-200 focus:border-amber-300"
              }`}
              placeholder="e.g., Google, Microsoft, Startup Inc."
            />
            {errors.company && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                {/* Custom warning icon */}
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.company}
              </p>
            )}
          </div>

          {/* Position */}
          <div className="space-y-2">
            <label
              htmlFor="position"
              className="block text-sm font-medium text-stone-700"
            >
              Position *
            </label>
            <input
              id="position"
              type="text"
              value={formData.position}
              onChange={(e) => handleChange("position", e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:ring-3 focus:ring-amber-200 transition-colors ${
                errors.position
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : "border-stone-200 focus:border-amber-300"
              }`}
              placeholder="e.g., Software Engineer, Product Manager"
            />
            {errors.position && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.position}
              </p>
            )}
          </div>
        </div>

        {/* Job URL */}
        <div className="space-y-2">
          <label
            htmlFor="url"
            className="block text-sm font-medium text-stone-700"
          >
            Job Posting URL *
          </label>
          <input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => handleChange("url", e.target.value)}
            className={`w-full px-3 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:ring-3 focus:ring-amber-200 transition-colors ${
              errors.url
                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                : "border-stone-200 focus:border-amber-300"
            }`}
            placeholder="https://company.com/careers/job-posting"
          />
          {errors.url && (
            <p className="text-red-600 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.url}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Application Date */}
          <div className="space-y-2">
            <label
              htmlFor="dateApplied"
              className="block text-sm font-medium text-stone-700"
            >
              Application Date *
            </label>
            <input
              id="dateApplied"
              type="date"
              value={formData.dateApplied}
              onChange={(e) => handleChange("dateApplied", e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:ring-3 focus:ring-amber-200 transition-colors ${
                errors.dateApplied
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : "border-stone-200 focus:border-amber-300"
              }`}
            />
            {errors.dateApplied && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.dateApplied}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-stone-700"
            >
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-3 focus:ring-amber-200 focus:border-amber-300 text-stone-700"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Resume Version */}
          <div className="space-y-2">
            <label
              htmlFor="resumeVersion"
              className="block text-sm font-medium text-stone-700"
            >
              Resume Version
            </label>
            <input
              id="resumeVersion"
              type="text"
              value={formData.resumeVersion}
              onChange={(e) => handleChange("resumeVersion", e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-3 focus:ring-amber-200 focus:border-amber-300"
              placeholder="v2.1, Tech-focused, etc."
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-stone-700"
          >
            Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-3 focus:ring-amber-200 focus:border-amber-300 resize-none"
            rows={4}
            placeholder="Add any additional notes about this application..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-stone-200">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-300 text-stone-700 hover:text-stone-800 font-medium py-2.5 px-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ease-out focus:outline-none focus:ring-3 focus:ring-stone-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 ease-out focus:outline-none focus:ring-3 focus:ring-amber-300"
          >
            <div className="flex items-center gap-2">
              {/* Custom checkmark icon */}
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
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
