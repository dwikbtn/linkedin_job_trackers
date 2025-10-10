import React from "react";

const Error = ({
  error,
  setError,
}: {
  error: string;
  setError: (error: string | null) => void;
}) => {
  return (
    <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
      {/* Custom warning icon */}
      <svg
        className="w-5 h-5 text-red-600 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-red-700 font-medium flex-1">{error}</span>
      <button
        onClick={() => setError(null)}
        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
        title="Dismiss error"
      >
        {/* Custom close icon */}
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default Error;
