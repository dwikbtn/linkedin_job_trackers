import { storage } from "#imports";
import { onMessage } from "@/utils/messaging";
import { JOBAPPLICATIONLIST } from "@/utils/storageName";
import { Job_Application } from "@/utils/types";

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
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Check if the tab has finished loading and has a URL
    if (changeInfo.status === "complete" && tab.url) {
      // Check if the URL is a LinkedIn page
      if (tab.url.includes("linkedin.com")) {
        console.log("LinkedIn visit detected!", {
          url: tab.url,
          tabId: tabId,
          title: tab.title || "Unknown title",
        });
      }
    }
  });

  // Listen for when tabs are activated (switched to)
  browser.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await browser.tabs.get(activeInfo.tabId);
      if (tab.url && tab.url.includes("linkedin.com")) {
        console.log("LinkedIn tab activated!", {
          url: tab.url,
          tabId: activeInfo.tabId,
          title: tab.title || "Unknown title",
        });
      }
    } catch (error) {
      // Handle case where tab might not be accessible
      console.log("Could not access tab info:", error);
    }
  });
});

//msg listener
onMessage("getApplications", async () => {
  const jobApplications = (await storage.getItem(
    `local:${JOBAPPLICATIONLIST}`
  )) as Job_Application[] | undefined;

  return jobApplications || [];
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
