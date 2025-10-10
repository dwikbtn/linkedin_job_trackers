import React, { useState, useMemo } from "react";
import { Job_Application } from "@/utils/types";
import { ApplicationCard } from "@/components/ui/ApplicationCard";
import { ApplicationGridView } from "@/components/ui/ApplicationGridView";

interface ApplicationListProps {
  applications: Job_Application[];
  onEdit: (application: Job_Application) => void; // For inline editing (table view)
  onDelete: (id: string) => void;
  onAdd: (application: Omit<Job_Application, "id">) => void;
  onViewDetails?: (application: Job_Application) => void; // For form-based editing (grid/list views)
}

type SortOption = "dateApplied" | "company" | "position" | "status";
type ViewMode = "grid" | "list" | "table";

export const ApplicationList: React.FC<ApplicationListProps> = ({
  applications,
  onEdit,
  onDelete,
  onAdd,
  onViewDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("dateApplied");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Get unique status values for filter
  const statusOptions = useMemo(() => {
    const statuses = [...new Set(applications.map((app) => app.status))];
    return statuses.sort();
  }, [applications]);

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    let filtered = applications.filter((app) => {
      const matchesSearch =
        app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.notes?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort applications
    filtered.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortBy) {
        case "dateApplied":
          aValue = new Date(a.dateApplied);
          bValue = new Date(b.dateApplied);
          break;
        case "company":
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
          break;
        case "position":
          aValue = a.position.toLowerCase();
          bValue = b.position.toLowerCase();
          break;
        case "status":
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        default:
          aValue = a.dateApplied;
          bValue = b.dateApplied;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [applications, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(option);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (option: SortOption) => {
    if (sortBy !== option) {
      return (
        <svg
          className="w-4 h-4 text-stone-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
        </svg>
      );
    }

    return sortOrder === "asc" ? (
      <svg
        className="w-4 h-4 text-amber-700"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-amber-700"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 15a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L13 9.414V15z" />
      </svg>
    );
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-3xl shadow-sm border border-amber-200 mx-auto mb-4">
          {/* Custom briefcase icon */}
          <svg
            className="w-8 h-8 text-amber-800"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M10 2h4a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2zM8 6h8V4h-4v2zm-2 4v2h12v-2H6z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-stone-800 mb-2">
          No Applications Yet
        </h3>
        <p className="text-stone-600 mb-6">
          Start tracking your job applications to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              {/* Custom search icon */}
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="text"
                placeholder="Search companies, positions, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-3 focus:ring-amber-200 focus:border-amber-300 transition-colors"
              />
            </div>
          </div>

          {/* Filters and View Controls */}
          <div className="flex items-center gap-4">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-3 focus:ring-amber-200 focus:border-amber-300 text-stone-700 min-w-[120px]"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-stone-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-amber-700 shadow-sm"
                    : "text-stone-600 hover:text-stone-800"
                }`}
                title="Grid view"
              >
                {/* Custom grid icon */}
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-amber-700 shadow-sm"
                    : "text-stone-600 hover:text-stone-800"
                }`}
                title="List view"
              >
                {/* Custom list icon */}
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "table"
                    ? "bg-white text-amber-700 shadow-sm"
                    : "text-stone-600 hover:text-stone-800"
                }`}
                title="Table view"
              >
                {/* Custom table icon */}
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v1H3V4z" />
                  <path d="M3 8h14v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" />
                  <path d="M8 8v8m4-8v8" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-200">
          <span className="text-sm text-stone-600 font-medium">Sort by:</span>
          <div className="flex items-center gap-2">
            {[
              { key: "dateApplied" as SortOption, label: "Date Applied" },
              { key: "company" as SortOption, label: "Company" },
              { key: "position" as SortOption, label: "Position" },
              { key: "status" as SortOption, label: "Status" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleSort(key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  sortBy === key
                    ? "bg-amber-100 text-amber-800 font-medium border border-amber-200"
                    : "text-stone-600 hover:text-stone-800 hover:bg-stone-100"
                }`}
              >
                {label}
                {getSortIcon(key)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-600">
          Showing {filteredAndSortedApplications.length} of{" "}
          {applications.length} applications
        </p>
      </div>

      {/* Applications Grid/List/Table */}
      {filteredAndSortedApplications.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-100 rounded-3xl shadow-sm border border-stone-200 mx-auto mb-4">
            {/* Custom search icon */}
            <svg
              className="w-8 h-8 text-stone-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-stone-800 mb-2">
            No matching applications
          </h3>
          <p className="text-stone-600">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : viewMode === "table" ? (
        <ApplicationGridView
          applications={filteredAndSortedApplications}
          onUpdate={onEdit}
          onDelete={onDelete}
          onAdd={onAdd}
        />
      ) : (
        <div className={viewMode === "grid" ? "jobs-grid" : "jobs-list"}>
          {filteredAndSortedApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onEdit={onViewDetails} // Use form-based editing for card views
              onDelete={onDelete}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};
