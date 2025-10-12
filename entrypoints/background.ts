import { storage } from "#imports";
import { onMessage } from "@/utils/messaging";
import { SMARTCAPTUREDATA, JOBAPPLICATIONLIST } from "@/utils/storageName";
import { Job_Application } from "@/utils/types";
import extractJobIdFromUrl from "@/utils/utils";

export default defineBackground(() => {
  // Initialize extension when background script loads
  console.log("Extension background script initialized");
  initStorage();

  // Listen for extension installation/startup events
  browser.runtime.onStartup.addListener(() => {
    console.log("Extension started up");
    initStorage();
  });

  browser.runtime.onInstalled.addListener((details) => {
    console.log("Extension installed/updated", details);

    if (details.reason === "install") {
      console.log("Extension installed for the first time");
      initStorage();
    } else if (details.reason === "update") {
      console.log("Extension updated from version", details.previousVersion);
      // Handle migration logic if needed
    }
  });

  // Listen for tab updates (navigation, page loads)
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Check if the tab has finished loading and has a URL
    if (changeInfo.status === "complete" && tab.url) {
      // Check if the URL is a LinkedIn page
      if (tab.url.includes("linkedin.com")) {
        detectJobPostFromCollectionsPage(tab);
        console.log("LinkedIn visit detected!", {
          url: tab.url,
          tabId: tabId,
          title: tab.title || "Unknown title",
        });
      }
      await detectJobFromSmartCapture();
    }
  });

  // Listen for when tabs are activated (switched to)
  browser.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await browser.tabs.get(activeInfo.tabId);
      detectJobPostFromCollectionsPage(tab);
      await detectJobFromSmartCapture();
    } catch (error) {
      // Handle case where tab might not be accessible
      console.log("Could not access tab info:", error);
    }
  });
});

// Normalize and extract bare domain from a URL or hostname
function extractDomain(input?: string | null): string | null {
  if (!input) return null;
  try {
    // If it's a full URL, URL() will parse; if it's just a hostname, prepend protocol
    const url = input.includes("://")
      ? new URL(input)
      : new URL(`https://${input}`);
    let host = url.hostname.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    return host;
  } catch {
    // Fallback: very simple cleanup
    let host = input.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    // Strip path if someone passed a URL-like string without protocol
    const slash = host.indexOf("/");
    if (slash !== -1) host = host.slice(0, slash);
    return host || null;
  }
}

//msg listener
onMessage("getApplications", async () => {
  const jobApplications = (await storage.getItem(
    `local:${JOBAPPLICATIONLIST}`
  )) as Job_Application[] | undefined;

  return jobApplications || [];
});

onMessage("saveApplication", async (msg) => {
  const application = msg.data;
  const jobApplications = (await storage.getItem(
    `local:${JOBAPPLICATIONLIST}`
  )) as Job_Application[] | undefined;

  const updatedApplications = jobApplications
    ? [...jobApplications, application]
    : [application];

  await storage.setItem(`local:${JOBAPPLICATIONLIST}`, updatedApplications);
});

onMessage("updateApplication", async (msg) => {
  const jobApplications = (await storage.getItem(
    `local:${JOBAPPLICATIONLIST}`
  )) as Job_Application[] | undefined;

  const application = msg.data as Job_Application;

  if (jobApplications) {
    const updatedApplications = jobApplications.map((app) =>
      app.id === application.id ? application : app
    );
    await storage.setItem(`local:${JOBAPPLICATIONLIST}`, updatedApplications);
  }
});

onMessage("deleteApplication", async (msg) => {
  const id = msg.data as string;
  const jobApplications = (await storage.getItem(
    `local:${JOBAPPLICATIONLIST}`
  )) as Job_Application[] | undefined;

  if (jobApplications) {
    const updatedApplications = jobApplications.filter((app) => app.id !== id);
    await storage.setItem(`local:${JOBAPPLICATIONLIST}`, updatedApplications);
  }
});

onMessage("saveElements", async (msg) => {
  const elements = msg.data;

  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  const domainOnly = extractDomain(tab?.url) || "unknown";
  const smartCaptureMapping: SmartCaptureMapping = {
    domain: domainOnly,
    jobTitleSelector: {
      idName:
        elements.find((el) => el.type === "jobTitle")?.selector.idName || "",
      className:
        elements.find((el) => el.type === "jobTitle")?.selector.className || "",
    },
    companySelector: {
      idName:
        elements.find((el) => el.type === "company")?.selector.idName || "",
      className:
        elements.find((el) => el.type === "company")?.selector.className || "",
    },
    applyButtonSelector: {
      idName:
        elements.find((el) => el.type === "applyButton")?.selector.idName || "",
      className:
        elements.find((el) => el.type === "applyButton")?.selector.className ||
        "",
    },
    previewJobTitle: "",
    previewCompany: "",
    createdAt: new Date().toISOString(),
  };
  const currentMappings = (await storage.getItem(
    `local:${SMARTCAPTUREDATA}`
  )) as SmartCaptureMapping[] | undefined;

  const updatedMappings = currentMappings
    ? [
        ...currentMappings.filter(
          (mapping) => mapping.domain !== smartCaptureMapping.domain
        ),
        smartCaptureMapping,
      ]
    : [smartCaptureMapping];

  console.log("Saving updated mappings:", updatedMappings);
  await storage.setItem(`local:${SMARTCAPTUREDATA}`, updatedMappings);
  await detectJobFromSmartCapture();
});

async function initStorage() {
  // Initialize storage with default values
  const jobApplications = (await storage.getItem(
    `local:${JOBAPPLICATIONLIST}`
  )) as Job_Application[] | undefined;

  if (!jobApplications) {
    await storage.setItem(`local:${JOBAPPLICATIONLIST}`, []);
    console.log("Initialized job applications storage.");
  } else {
    console.log("Job applications storage already initialized.");
  }
}

function detectJobPostFromCollectionsPage(tab: Browser.tabs.Tab) {
  console.log("Checking for job post on collections page...", tab);

  if (!tab.url) return;

  // Extract job ID from LinkedIn URLs using regex
  const jobId = extractJobIdFromUrl(tab.url);

  if (jobId) {
    console.log("Job ID detected:", jobId);
    console.log("Full URL:", tab.url);
    // Send message to content script to fetch job details
    sendMessage("CSgetDataFromJobCollection", undefined, tab.id);
  }
}

async function detectJobFromSmartCapture() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  const smartCaptureStorage = (await storage.getItem(
    `local:${SMARTCAPTUREDATA}`
  )) as SmartCaptureMapping[] | undefined;

  // Check if there's a mapping for the current domain
  if (
    tab.url &&
    smartCaptureStorage &&
    (() => {
      const currentDomain = extractDomain(tab.url);
      return currentDomain
        ? smartCaptureStorage.some(
            (m) => extractDomain(m.domain) === currentDomain
          )
        : false;
    })()
  ) {
    console.log("Smart Capture mapping found for this domain.");
    const currentDomain = extractDomain(tab.url);
    const mapping = smartCaptureStorage.find(
      (m) => extractDomain(m.domain) === currentDomain
    );
    if (mapping && tab.id) {
      sendMessage("CSGetSmartCaptureMappings", mapping, tab.id);
      console.log(
        "Sent Smart Capture mapping to content script for domain:",
        currentDomain
      );
    }
  }
  console.log(smartCaptureStorage);
  console.log(tab.url);
}

//NOTE: HOW TO RECORD SMART CAPTURE STEPS
// 1. User clicks "Start Smart Capture" in popup -> sends "startSmartCapture" message to content script
// 2. Content script activates smart capture mode, Shows overlay UI, with short explain what smart capture is
// 3. user clicks Okay, Show Step 1: "Select Job Title" -> Instruct user to hover and click on job title element
// 4. User hovers over elements, we highlight them, user clicks on an element -> send "captureElement" message to background with stepId "jobTitle"
// 5. Background receives message, sends back element info (selector, text) to content script
// 6. Content script shows preview of captured element, asks user to confirm or retry
// 7. If user confirms, send "confirmElement" message to background with stepId and element info
// 8. Background saves the mapping for the domain in storage
// 9. Content script moves to next step: "Select Company Name", repeat steps 4-8
// 10. Next step: "Select Apply Button", repeat steps 4-8
// 11. After all steps completed, show summary of captured data, ask user to save or restart
// 12. If saved, store the mapping in background storage for future use on this domain
// 13. User can stop smart capture anytime by clicking "Stop Smart Capture" button, which sends "stopSmartCapture" message to background
