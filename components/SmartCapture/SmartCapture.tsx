import React from "react";
import SmartCaptureSteps from "../ui/SmartCaptureSteps";
import Modal from "../ui/Modal";
import SmartCaptureExplanation from "../ui/SmartCaptureExplanation";
// Note: Not wired. Example usage of the hover capture utility:
import enableHoverCapture from "@/utils/hoverCapture";
import { sendMessage } from "@/utils/messaging";
import type { SmartCaptureSelector } from "@/utils/types";

const SmartCapture = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const [startStep, setStartStep] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState<
    "jobTitle" | "company" | "applyButton"
  >("jobTitle");

  const [capturedData, setCapturedData] = React.useState<{
    jobTitle?: { text: string; selector: SmartCaptureSelector };
    company?: { text: string; selector: SmartCaptureSelector };
    applyButton?: { text: string; selector: SmartCaptureSelector };
  }>({});

  const [isCapturing, setIsCapturing] = React.useState(false);

  // Example: How to invoke hover capture (do not enable by default)
  const startHoverPick = React.useCallback(() => {
    setIsCapturing(true);
    console.log("Starting hover capture...");
    // Hide modal/overlay while recording selection
    setIsOpen(false);
    const stop = enableHoverCapture({
      onClick: (el) => {
        // console.log("[SmartCapture Demo] Picked element:", el.getAttribute());
        //log classname and if there's id
        console.log("[SmartCapture Demo] Picked class:", el.className);
        console.log("[SmartCapture Demo] Picked id:", el.id);
        console.log("[SmartCapture Demo] Picked text:", el.innerText?.trim());

        setCapturedData((prev) => ({
          ...prev,
          [currentStep]: {
            text: el.innerText?.trim(),
            selector: {
              // Ensure we always store strings as required by SmartCaptureSelector
              idName: el.id,
              className: el.className,
            },
          },
        }));

        const nextStep =
          currentStep === "jobTitle"
            ? "company"
            : currentStep === "company"
            ? "applyButton"
            : null;
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

  function handleOnComplete() {
    sendMessage("saveElements", [
      {
        type: "jobTitle",
        selector: {
          idName: capturedData.jobTitle?.selector.idName,
          className: capturedData.jobTitle?.selector.className ?? "",
        },
      },
      {
        type: "company",
        selector: {
          idName: capturedData.company?.selector.idName,
          className: capturedData.company?.selector.className ?? "",
        },
      },
      {
        type: "applyButton",
        selector: {
          idName: capturedData.applyButton?.selector.idName,
          className: capturedData.applyButton?.selector.className ?? "",
        },
      },
    ]);

    setIsOpen(false);
    setStartStep(false);
    setCurrentStep("jobTitle");
    setCapturedData({});
    setIsCapturing(false);
  }

  console.log("SmartCapture render, isOpen:", isOpen);

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
          onCompleteRecord={() => handleOnComplete()}
        />
      )}
    </Modal>
  );
};

export default SmartCapture;
