import { defineExtensionMessaging } from "@webext-core/messaging";
import { Job_Application } from "./types";

interface ProtocolMap {
  saveApplication(application: Job_Application): Job_Application;
  getApplications(): Job_Application[];
  deleteApplication(id: string): void;
}

export const { onMessage, sendMessage } =
  defineExtensionMessaging<ProtocolMap>();
