import { defineExtensionMessaging } from "@webext-core/messaging";
import { Job_Application, SmartCaptureMapping, ElementInfo } from "./types";

interface ProtocolMap {
  saveApplication(application: Job_Application): void;
  getApplications(): Job_Application[];
  deleteApplication(id: string): void;
  updateApplication(application: Job_Application): void;
  CSgetDataFromJobCollection(): void;

  // Smart Capture messages
  startSmartCapture(): void;
  stopSmartCapture(): void;
  captureElement(stepId: string): ElementInfo | null;
  confirmElement(stepId: string, elementInfo: ElementInfo): void;
  saveSmartCaptureMapping(mapping: SmartCaptureMapping): void;
  getSmartCaptureMappings(): SmartCaptureMapping[];
  autoSaveFromSmartCapture(application: Job_Application): void;
}

export const { onMessage, sendMessage } =
  defineExtensionMessaging<ProtocolMap>();
