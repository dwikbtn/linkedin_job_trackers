import React from "react";
import SmartCaptureSteps from "../ui/SmartCaptureSteps";

const SmartCapture = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [startStep, setStartStep] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState<
    "jobTitle" | "company" | "applyButton"
  >("jobTitle");

  function handleStepComplete(step: "jobTitle" | "company" | "applyButton") {
    console.log("Step completed:", step);
  }

  function handleRetry() {
    console.log("Retrying Smart Capture process");
  }
  const [capturedData, setCapturedData] = React.useState<{
    jobTitle?: { text: string; selector: string };
    company?: { text: string; selector: string };
    applyButton?: { text: string; selector: string };
  }>({});

  const [isCapturing, setIsCapturing] = React.useState(false);

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      {!startStep && (
        <SmartCaptureExplanation
          showButtons
          onProceed={() => setStartStep(true)}
        />
      )}
      {/* Steps */}
      {startStep && (
        <SmartCaptureSteps
          currentStep={currentStep}
          onStepComplete={handleStepComplete}
          onCancel={() => setStartStep(false)}
          onRetry={handleRetry}
          capturedData={capturedData}
          isCapturing={isCapturing}
        />
      )}
    </Modal>
  );
};

export default SmartCapture;
