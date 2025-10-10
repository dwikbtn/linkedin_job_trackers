import React, { useState, useRef, useEffect } from "react";
import { Job_Application } from "../utils/types";

interface ApplicationGridViewProps {
  applications: Job_Application[];
  onUpdate: (application: Job_Application) => void;
  onDelete: (id: string) => void;
  onAdd: (application: Omit<Job_Application, "id">) => void;
}

interface EditingCell {
  rowId: string;
  column: keyof Job_Application;
}

const STATUS_OPTIONS = ["applied", "interview", "offer", "rejected", "pending"];

export const ApplicationGridView: React.FC<ApplicationGridViewProps> = ({
  applications,
  onUpdate,
  onDelete,
  onAdd,
}) => {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newRow, setNewRow] = useState<Partial<Job_Application>>({});
  const [showNewRow, setShowNewRow] = useState(false);
  const inputRef = useRef<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      if (
        inputRef.current instanceof HTMLInputElement ||
        inputRef.current instanceof HTMLTextAreaElement
      ) {
        inputRef.current.select();
      }
    }
  }, [editingCell]);

  const handleCellClick = (
    application: Job_Application,
    column: keyof Job_Application
  ) => {
    if (column === "id") return; // Don't allow editing ID

    setEditingCell({ rowId: application.id, column });
    setEditValue(String(application[column] || ""));
  };

  const handleCellUpdate = () => {
    if (!editingCell) return;

    const application = applications.find(
      (app) => app.id === editingCell.rowId
    );
    if (!application) return;

    const updatedApplication = {
      ...application,
      [editingCell.column]: editValue,
    };

    onUpdate(updatedApplication);
    setEditingCell(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCellUpdate();
    } else if (e.key === "Escape") {
      setEditingCell(null);
      setEditValue("");
    }
  };

  const handleNewRowChange = (
    column: keyof Omit<Job_Application, "id">,
    value: string
  ) => {
    setNewRow((prev) => ({ ...prev, [column]: value }));
  };

  const handleAddRow = () => {
    if (!newRow.company || !newRow.position || !newRow.dateApplied) {
      alert("Please fill in Company, Position, and Date Applied fields");
      return;
    }

    const applicationToAdd: Omit<Job_Application, "id"> = {
      company: newRow.company || "",
      position: newRow.position || "",
      dateApplied: newRow.dateApplied || "",
      status: newRow.status || "applied",
      url: newRow.url || "",
      resumeVersion: newRow.resumeVersion || "",
      notes: newRow.notes || "",
    };

    onAdd(applicationToAdd);
    setNewRow({});
    setShowNewRow(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US");
  };

  const getStatusBadge = (status: string) => {
    const config = {
      applied: "bg-amber-100 text-amber-800 border-amber-200",
      interview: "bg-orange-100 text-orange-800 border-orange-200",
      offer: "bg-emerald-100 text-emerald-800 border-emerald-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      pending: "bg-stone-100 text-stone-800 border-stone-200",
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
          config[status as keyof typeof config] || config.pending
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderCell = (
    application: Job_Application,
    column: keyof Job_Application
  ) => {
    const isEditing =
      editingCell?.rowId === application.id && editingCell?.column === column;
    const value = application[column] || "";

    if (isEditing) {
      if (column === "status") {
        return (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              // Immediately update for status changes
              const application = applications.find(
                (app) => app.id === editingCell?.rowId
              );
              if (application) {
                const updatedApplication = {
                  ...application,
                  [column]: e.target.value,
                };
                onUpdate(updatedApplication);
                setEditingCell(null);
                setEditValue("");
              }
            }}
            onBlur={handleCellUpdate}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        );
      }

      if (column === "notes") {
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellUpdate}
            onKeyDown={handleKeyDown}
            rows={2}
            className="w-full px-2 py-1 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
          />
        );
      }

      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={column === "dateApplied" ? "date" : "text"}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCellUpdate}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      );
    }

    // Display mode
    if (column === "status") {
      return getStatusBadge(String(value));
    }

    if (column === "dateApplied") {
      return formatDate(String(value));
    }

    if (column === "url" && value) {
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-700 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          View Job
        </a>
      );
    }

    if (column === "notes" && value) {
      return (
        <div className="max-w-xs truncate" title={String(value)}>
          {String(value)}
        </div>
      );
    }

    return String(value);
  };

  const renderNewRowCell = (column: keyof Omit<Job_Application, "id">) => {
    if (column === "status") {
      return (
        <select
          value={newRow.status || "applied"}
          onChange={(e) => handleNewRowChange(column, e.target.value)}
          className="w-full px-2 py-1 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-200"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      );
    }

    if (column === "notes") {
      return (
        <textarea
          value={newRow.notes || ""}
          onChange={(e) => handleNewRowChange(column, e.target.value)}
          placeholder="Notes..."
          rows={2}
          className="w-full px-2 py-1 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
        />
      );
    }

    return (
      <input
        type={column === "dateApplied" ? "date" : "text"}
        value={newRow[column] || ""}
        onChange={(e) => handleNewRowChange(column, e.target.value)}
        placeholder={
          column === "company"
            ? "Company*"
            : column === "position"
            ? "Position*"
            : column === "dateApplied"
            ? "Date Applied*"
            : column === "url"
            ? "Job URL"
            : column === "resumeVersion"
            ? "Resume Version"
            : ""
        }
        className={`w-full px-2 py-1 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-200 ${
          (column === "company" ||
            column === "position" ||
            column === "dateApplied") &&
          !newRow[column]
            ? "border-red-300"
            : ""
        }`}
      />
    );
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-stone-800 min-w-[150px]">
                Company
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-stone-800 min-w-[150px]">
                Position
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-stone-800 min-w-[120px]">
                Date Applied
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-stone-800 min-w-[120px]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-stone-800 min-w-[100px]">
                Job URL
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-stone-800 min-w-[120px]">
                Resume Version
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-stone-800 min-w-[200px]">
                Notes
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-stone-800 w-[60px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {applications.map((application) => (
              <tr key={application.id} className="hover:bg-stone-50 group">
                <td
                  className="px-4 py-3 text-sm text-stone-800 cursor-pointer hover:bg-amber-50"
                  onClick={() => handleCellClick(application, "company")}
                >
                  {renderCell(application, "company")}
                </td>
                <td
                  className="px-4 py-3 text-sm text-stone-800 cursor-pointer hover:bg-amber-50"
                  onClick={() => handleCellClick(application, "position")}
                >
                  {renderCell(application, "position")}
                </td>
                <td
                  className="px-4 py-3 text-sm text-stone-800 cursor-pointer hover:bg-amber-50"
                  onClick={() => handleCellClick(application, "dateApplied")}
                >
                  {renderCell(application, "dateApplied")}
                </td>
                <td
                  className="px-4 py-3 text-sm text-stone-800 cursor-pointer hover:bg-amber-50"
                  onClick={() => handleCellClick(application, "status")}
                >
                  {renderCell(application, "status")}
                </td>
                <td
                  className="px-4 py-3 text-sm text-stone-800 cursor-pointer hover:bg-amber-50"
                  onClick={() => handleCellClick(application, "url")}
                >
                  {renderCell(application, "url")}
                </td>
                <td
                  className="px-4 py-3 text-sm text-stone-800 cursor-pointer hover:bg-amber-50"
                  onClick={() => handleCellClick(application, "resumeVersion")}
                >
                  {renderCell(application, "resumeVersion")}
                </td>
                <td
                  className="px-4 py-3 text-sm text-stone-800 cursor-pointer hover:bg-amber-50"
                  onClick={() => handleCellClick(application, "notes")}
                >
                  {renderCell(application, "notes")}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onDelete(application.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete application"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}

            {/* New Row */}
            {showNewRow && (
              <tr className="bg-amber-50 border-2 border-amber-200">
                <td className="px-4 py-3">{renderNewRowCell("company")}</td>
                <td className="px-4 py-3">{renderNewRowCell("position")}</td>
                <td className="px-4 py-3">{renderNewRowCell("dateApplied")}</td>
                <td className="px-4 py-3">{renderNewRowCell("status")}</td>
                <td className="px-4 py-3">{renderNewRowCell("url")}</td>
                <td className="px-4 py-3">
                  {renderNewRowCell("resumeVersion")}
                </td>
                <td className="px-4 py-3">{renderNewRowCell("notes")}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={handleAddRow}
                      className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Save new application"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setShowNewRow(false);
                        setNewRow({});
                      }}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancel"
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
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Row Button */}
      {!showNewRow && (
        <div className="px-4 py-3 border-t border-stone-200 bg-stone-50">
          <button
            onClick={() => setShowNewRow(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add new application
          </button>
        </div>
      )}
    </div>
  );
};
