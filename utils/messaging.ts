import { defineExtensionMessaging } from "@webext-core/messaging";
import { Job_Application } from "./types";

export const GETAPPLICATION = "getApplications";
export const SAVEAPPLICATION = "saveApplication";
export const DELETEAPPLICATION = "deleteApplication";
export const UPDATEAPPLICATION = "updateApplication";

interface ProtocolMap {
  saveApplication(application: Job_Application): void;
  getApplications(): Job_Application[];
  deleteApplication(id: string): void;
  updateApplication(application: Job_Application): void;
}

export const { onMessage, sendMessage } =
  defineExtensionMessaging<ProtocolMap>();
