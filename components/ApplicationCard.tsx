import React from "react";
import { Job_Application } from "../utils/types";

interface ApplicationCardProps {
  application: Job_Application;
  onEdit?: (application: Job_Application) => void;
  onDelete?: (id: string) => void;
  onViewDetails?: (application: Job_Application) => void;
}

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return {
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          ),
          className:
            "inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full border border-amber-200",
        };
      case "interview":
        return {
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          ),
          className:
            "inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-200",
        };
      case "offer":
        return {
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ),
          className:
            "inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full border border-emerald-200",
        };
      case "rejected":
        return {
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ),
          className:
            "inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full border border-red-200",
        };
      default:
        return {
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          ),
          className:
            "inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-800 text-xs font-medium rounded-full border border-stone-200",
        };
    }
  };

  const config = getStatusConfig(status);
  return (
    <span className={config.className}>
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-stone-800 mb-1">
            {application.position}
          </h3>
          <p className="text-stone-600 font-medium">{application.company}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon status={application.status} />
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(application)}
                  className="p-2 text-stone-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                  title="Edit application"
                >
                  {/* Custom edit icon */}
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(application.id)}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete application"
                >
                  {/* Custom trash icon */}
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
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-stone-600">
          <div className="flex items-center gap-2">
            {/* Custom calendar icon */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            <span>Applied {formatDate(application.dateApplied)}</span>
          </div>
          {application.resumeVersion && (
            <div className="flex items-center gap-2">
              {/* Custom document icon */}
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{application.resumeVersion}</span>
            </div>
          )}
        </div>

        {application.notes && (
          <div className="text-sm text-stone-600 bg-stone-50 rounded-lg p-3 border border-stone-100">
            <p className="line-clamp-2">{application.notes}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
        <a
          href={application.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1 hover:underline"
        >
          View Job Posting
          {/* Custom external link icon */}
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z" />
          </svg>
        </a>

        {onViewDetails && (
          <button
            onClick={() => onViewDetails(application)}
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-800 font-medium py-1.5 px-3 rounded-lg text-sm transition-colors"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};
