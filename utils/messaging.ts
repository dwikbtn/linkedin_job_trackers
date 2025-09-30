import { defineExtensionMessaging } from "@webext-core/messaging";
import { Application } from "./types";

interface ProtocolMap {
  saveApplication(): Application;
  getApplications(): Application[];
  deleteApplication(id: string): void;
}

export const messaging = defineExtensionMessaging<ProtocolMap>();
