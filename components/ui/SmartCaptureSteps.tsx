import React from "react";

export type SmartCaptureStep = "jobTitle" | "company" | "applyButton";

interface SmartCaptureStepsProps {
  currentStep: SmartCaptureStep;
  onCancel?: () => void;
  onRetry?: () => void;
  onStartRecord?: () => void;
  onCompleteRecord?: () => void;
  capturedData?: {
    jobTitle?: { text: string; selector: string };
    company?: { text: string; selector: string };
    applyButton?: { text: string; selector: string };
  };
  isCapturing?: boolean;
}

const SmartCaptureSteps: React.FC<SmartCaptureStepsProps> = ({
  currentStep,
  onCancel,
  onRetry,
  onStartRecord,
  onCompleteRecord,
  capturedData = {},
  isCapturing = false,
}) => {
  const steps = [
    {
      id: "jobTitle" as SmartCaptureStep,
      title: "Select Job Title",
      description: "Click on the job title element on the page",
      icon: "📋",
      instruction: "Hover over the job title and click when it's highlighted",
    },
    {
      id: "company" as SmartCaptureStep,
      title: "Select Company Name",
      description: "Click on the company name element on the page",
      icon: "🏢",
      instruction:
        "Hover over the company name and click when it's highlighted",
    },
    {
      id: "applyButton" as SmartCaptureStep,
      title: "Select Apply Button",
      description: "Click on the apply/submit button element",
      icon: "🎯",
      instruction:
        "Hover over the apply button and click when it's highlighted",
    },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const currentStepData = steps[currentStepIndex];

  const isStepCompleted = (stepId: SmartCaptureStep) => {
    return capturedData[stepId] !== undefined;
  };

  const allStepsCompleted =
    isStepCompleted("jobTitle") &&
    isStepCompleted("company") &&
    isStepCompleted("applyButton");

  const getStepStatus = (stepId: SmartCaptureStep, index: number) => {
    if (isStepCompleted(stepId)) return "completed";
    if (index === currentStepIndex) return "current";
    if (index < currentStepIndex) return "completed";
    return "upcoming";
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Smart Capture</h3>
          <span className="text-sm text-gray-500">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3 mb-6">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, index);
          const isActive = step.id === currentStep;

          return (
            <div
              key={step.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-all ${
                isActive
                  ? "border-blue-300 bg-blue-50"
                  : status === "completed"
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              {/* Step Icon/Status */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  status === "completed"
                    ? "bg-green-600 text-white"
                    : isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {status === "completed" ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <h4
                  className={`text-sm font-medium ${
                    isActive
                      ? "text-blue-900"
                      : status === "completed"
                      ? "text-green-900"
                      : "text-gray-700"
                  }`}
                >
                  {step.title}
                </h4>
                <p
                  className={`text-xs mt-1 ${
                    isActive
                      ? "text-blue-700"
                      : status === "completed"
                      ? "text-green-700"
                      : "text-gray-500"
                  }`}
                >
                  {step.description}
                </p>

                {/* Show captured data if completed */}
                {status === "completed" && capturedData[step.id] && (
                  <div className="mt-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    ✓ Captured: "{capturedData[step.id]?.text}"
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Step Instructions */}
      {currentStepData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">{currentStepData.icon}</span>
            <h4 className="font-medium text-blue-900">
              {currentStepData.title}
            </h4>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            {currentStepData.instruction}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isCapturing ? (
                <>
                  <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-xs text-blue-600">
                    Waiting for your selection...
                  </span>
                </>
              ) : (
                onStartRecord && (
                  <button
                    onClick={onStartRecord}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Start Record
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 items-center">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Retry Step
          </button>
        )}

        {/* Complete Record Button: visible only when all steps completed */}
        {allStepsCompleted && !isCapturing && (
          <button
            onClick={() => onCompleteRecord?.()}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Complete Record
          </button>
        )}
      </div>
    </div>
  );
};

export default SmartCaptureSteps;
