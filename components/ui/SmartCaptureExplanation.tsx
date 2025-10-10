import React from 'react';

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
  cancelButtonText = "Cancel"
}) => {
  return (
    <div className="text-center">
      {/* Icon */}
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
        <svg
          className="h-6 w-6 text-blue-600"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Smart Capture
      </h3>

      {/* Description */}
      <div className="text-sm text-gray-600 mb-6 space-y-3">
        <p>
          Smart Capture helps you automatically detect job postings on any website 
          by learning the structure of the page.
        </p>
        
        <div className="text-left bg-gray-50 p-3 rounded-lg">
          <p className="font-medium text-gray-700 mb-2">How it works:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Click on the job title element</li>
            <li>Click on the company name element</li>
            <li>Click on the apply button element</li>
            <li>We'll save this pattern for future use</li>
          </ol>
        </div>

        <p className="text-xs text-gray-500">
          This process only takes a minute and will make tracking job applications 
          much easier on this website.
        </p>
      </div>

      {/* Buttons */}
      {showButtons && (
        <div className="flex space-x-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {cancelButtonText}
            </button>
          )}
          {onProceed && (
            <button
              onClick={onProceed}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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