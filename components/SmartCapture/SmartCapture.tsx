import React from "react";
import SmartCaptureSteps from "../ui/SmartCaptureSteps";
import Modal from "../ui/Modal";
import SmartCaptureExplanation from "../ui/SmartCaptureExplanation";
// Note: Not wired. Example usage of the hover capture utility:
import enableHoverCapture from "@/utils/hoverCapture";

const SmartCapture = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [startStep, setStartStep] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState<
    "jobTitle" | "company" | "applyButton"
  >("jobTitle");

  const [capturedData, setCapturedData] = React.useState<{
    jobTitle?: { text: string; selector: string };
    company?: { text: string; selector: string };
    applyButton?: { text: string; selector: string };
  }>({});

  const [isCapturing, setIsCapturing] = React.useState(false);

  console.log(capturedData);
  console.log(currentStep);
  // Example: How to invoke hover capture (do not enable by default)
  const startHoverPick = React.useCallback(() => {
    setIsCapturing(true);
    console.log("Starting hover capture...");
    // Hide modal/overlay while recording selection
    setIsOpen(false);
    const stop = enableHoverCapture({
      onClick: (el) => {
        console.log("[SmartCapture Demo] Picked element:", el);
        console.log("[SmartCapture Demo] Picked text:", el.innerText?.trim());
        console.log(currentStep);
        setCapturedData((prev) => ({
          ...prev,
          [currentStep]: {
            text: el.innerText?.trim(),
            selector: el.getAttribute("data-selector"),
          },
        }));

        const nextStep =
          currentStep === "jobTitle"
            ? "company"
            : currentStep === "company"
            ? "applyButton"
            : null;

        console.log("currentStep:", currentStep);
        console.log("Next step:", nextStep);
        if (nextStep) {
          setCurrentStep(nextStep);
        }

        stop();
        setIsCapturing(false);

        // Re-open modal after selection completes
        // Use a micro delay to ensure the click event fully settles
        setTimeout(() => setIsOpen(true), 0);
      },
    });
  }, [currentStep]);

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
          onCancel={() => setStartStep(false)}
          capturedData={capturedData}
          isCapturing={isCapturing}
          onStartRecord={() => startHoverPick()}
          onCompleteRecord={() => setIsOpen(false)}
        />
      )}
    </Modal>
  );
};

export default SmartCapture;
