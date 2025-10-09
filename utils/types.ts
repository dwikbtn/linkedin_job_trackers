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

// Smart Capture types
export interface SmartCaptureMapping {
  domain: string;
  jobTitleSelector: string;
  companySelector: string;
  applyButtonSelector: string;
  previewJobTitle: string;
  previewCompany: string;
  createdAt: string;
}

export interface SmartCaptureStep {
  id: "jobTitle" | "company" | "applyButton";
  title: string;
  description: string;
  completed: boolean;
  selector?: string;
  previewText?: string;
}

export interface SmartCaptureState {
  isActive: boolean;
  currentStep: number;
  steps: SmartCaptureStep[];
  selectedElement?: HTMLElement;
  hoveredElement?: HTMLElement;
}

export interface ElementInfo {
  selector: string;
  element: HTMLElement;
  text: string;
  tagName: string;
}

export const CONTENT_ROOT_ID = "career-tracker-root";
