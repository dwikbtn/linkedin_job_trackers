export type Job_Application = {
  id: string;
  url: string;
  company: string;
  position: string;
  dateApplied: string;
  status: string;
  resumeVersion?: string;
  notes?: string;
};

export type SmartCaptureSelector = {
  idName?: string;
  className: string;
};

// Smart Capture types
export interface SmartCaptureMapping {
  domain: string;
  jobTitleSelector: SmartCaptureSelector;
  companySelector: SmartCaptureSelector;
  applyButtonSelector: SmartCaptureSelector;
  previewJobTitle: string;
  previewCompany: string;
  createdAt: string;
}

export interface ElementInfo {
  type: "jobTitle" | "company" | "applyButton";
  selector: SmartCaptureSelector;
}

export const CONTENT_ROOT_ID = "career-tracker-root";
