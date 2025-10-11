import React from "react";

interface SmartCaptureExplanationProps {
  onProceed?: () => void;
  onCancel?: () => void;
  showButtons?: boolean;
  proceedButtonText?: string;
  cancelButtonText?: string;
}

const SmartCaptureExplanation: React.FC<SmartCaptureExplanationProps> = ({
  onProceed,
  onCancel,
  showButtons = true,
  proceedButtonText = "Start Smart Capture",
  cancelButtonText = "Cancel",
}) => {
  return (
    <div className="text-center bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
      {/* Icon */}
      <div className="mx-auto inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-100 border border-amber-200 mb-4 shadow-sm">
        {/* Custom crosshair/target icon to imply precise capture */}
        <svg
          className="w-7 h-7 text-amber-800"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1.055A7.001 7.001 0 0116.945 9H18a1 1 0 110 2h-1.055A7.001 7.001 0 0111 16.945V18a1 1 0 11-2 0v-1.055A7.001 7.001 0 013.055 11H2a1 1 0 110-2h1.055A7.001 7.001 0 019 3.055V2a1 1 0 011-1zm0 4a4 4 0 100 8 4 4 0 000-8z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-xl md:text-2xl font-bold text-stone-800 mb-2">
        Smart Capture
      </h3>

      {/* Description */}
      <div className="text-sm text-stone-600 mb-6 space-y-3">
        <p>
          Smart Capture helps you automatically detect job postings on any
          website by learning the structure of the page.
        </p>

        <div className="text-left bg-stone-50 p-4 rounded-xl border border-stone-200">
          <p className="font-medium text-stone-700 mb-2">How it works:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-stone-700">
            <li>Click on the job title element</li>
            <li>Click on the company name element</li>
            <li>Click on the apply button element</li>
            <li>We'll save this pattern for future use</li>
          </ol>
        </div>

        <p className="text-xs text-stone-500">
          This process only takes a minute and will make tracking job
          applications much easier on this website.
        </p>
      </div>

      {/* Buttons */}
      {showButtons && (
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:text-stone-800 focus:outline-none focus:ring-3 focus:ring-stone-200 transition-all"
            >
              {cancelButtonText}
            </button>
          )}
          {onProceed && (
            <button
              onClick={onProceed}
              className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-amber-700 border border-amber-700 rounded-xl hover:bg-amber-800 focus:outline-none focus:ring-3 focus:ring-amber-300 transition-all shadow-sm"
            >
              {proceedButtonText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartCaptureExplanation;
