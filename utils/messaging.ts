import { defineExtensionMessaging } from "@webext-core/messaging";
import { Job_Application } from "./types";

interface ProtocolMap {
  saveApplication(application: Job_Application): void;
  getApplications(): Job_Application[];
  deleteApplication(id: string): void;
  updateApplication(application: Job_Application): void;
  CSgetDataFromJobCollection(): void;
}

export const { onMessage, sendMessage } =
  defineExtensionMessaging<ProtocolMap>();
