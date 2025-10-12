import { defineExtensionMessaging } from "@webext-core/messaging";
import { Job_Application, SmartCaptureMapping } from "./types";

interface ProtocolMap {
  saveApplication(application: Job_Application): void;
  getApplications(): Job_Application[];
  deleteApplication(id: string): void;
  updateApplication(application: Job_Application): void;
  CSgetDataFromJobCollection(): void;
  CSGetSmartCaptureMappings(params: SmartCaptureMapping): void;

  // Smart Capture messages
  startSmartCapture(): void;
  stopSmartCapture(): void;
  saveElements(elements: ElementInfo[]): void;
}

export const { onMessage, sendMessage } =
  defineExtensionMessaging<ProtocolMap>();
