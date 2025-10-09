//import tailwind.css from assets
import "~/assets/tailwind.css";

import { CONTENT_ROOT_ID, Job_Application } from "@/utils/types";
import extractJobIdFromUrl from "@/utils/utils";
import { SmartCaptureUI } from "@/utils/smartCaptureUI";
import { SmartCaptureStorage } from "@/utils/smartCaptureStorage";

export default defineContentScript({
  matches: ["<all_urls>"], // Changed to match all websites for Smart Capture
  cssInjectionMode: "ui",
  async main(ctx) {
    console.log("Content script loaded!", {
      id: browser.runtime.id,
      domain: window.location.hostname,
    });

    // Declare smartCaptureUI in main scope
    let smartCaptureUI: SmartCaptureUI;

    const ui = await createShadowRootUi(ctx, {
      name: "career-tracker-root",
      position: "inline",
      anchor: "body",
      onMount(container) {
        // Define how your UI will be mounted inside the container
        const app = document.createElement("div");
        app.id = CONTENT_ROOT_ID;
        // app.textContent = "Hello world!";
        container.append(app);

        // Initialize Smart Capture UI with the shadow root container
        smartCaptureUI = new SmartCaptureUI(app);
        window.smartCaptureUI = smartCaptureUI;

        // Initialize runtime detection for existing mappings
        initializeRuntimeDetection();
      },
    });

    // 4. Mount the UI
    ui.mount();

    // Listen for existing job collection messages (LinkedIn specific)
    onMessage("CSgetDataFromJobCollection", () => {
      console.log("CSgetDataFromJobCollection message received");

      if (window.location.hostname.includes("linkedin.com")) {
        const applyJobButton = document.querySelector("#jobs-apply-button-id");
        if (applyJobButton) {
          const data = getJobDetailsFromPage();
          applyJobButton.addEventListener("click", () => {
            console.log("Apply button clicked, extracted job data:", data);
            sendMessage("saveApplication", data);
          });
        } else {
          console.log("No job application button found on this page.");
        }
      }
    });

    // Listen for Smart Capture messages
    onMessage("startSmartCapture", () => {
      console.log("Starting Smart Capture");
      smartCaptureUI.startCapture();
    });

    onMessage("stopSmartCapture", () => {
      console.log("Stopping Smart Capture");
      smartCaptureUI.stopCapture();
    });

    onMessage("saveSmartCaptureMapping", async (data) => {
      console.log("Saving Smart Capture mapping:", data);
      try {
        const mapping = data as any; // Type assertion for the mapping data
        await SmartCaptureStorage.saveMapping(mapping);

        // Reinitialize runtime detection with new mapping
        initializeRuntimeDetection();

        // Show success notification
        showNotification(
          "Smart Capture mapping saved successfully!",
          "success"
        );
      } catch (error) {
        console.error("Error saving Smart Capture mapping:", error);
        showNotification("Failed to save Smart Capture mapping", "error");
      }
    });
  },
});

/**
 * Initialize runtime detection for automatic job application capture
 */
async function initializeRuntimeDetection(): Promise<void> {
  try {
    const currentDomain = SmartCaptureStorage.getCurrentDomain();
    const mapping = await SmartCaptureStorage.getMappingForDomain(
      currentDomain
    );

    if (!mapping) {
      console.log(
        `No Smart Capture mapping found for domain: ${currentDomain}`
      );
      return;
    }

    console.log(`Smart Capture mapping found for ${currentDomain}:`, mapping);

    // Set up click detection for the apply button
    setupApplyButtonDetection(mapping);
  } catch (error) {
    console.error("Error initializing runtime detection:", error);
  }
}

/**
 * Setup detection for apply button clicks using the saved mapping
 */
function setupApplyButtonDetection(mapping: any): void {
  // Use event delegation to handle dynamically added elements
  document.addEventListener(
    "click",
    async (event) => {
      const target = event.target as HTMLElement;

      // Check if the clicked element matches the apply button selector
      if (
        target.matches(mapping.applyButtonSelector) ||
        target.closest(mapping.applyButtonSelector)
      ) {
        console.log(
          "Apply button clicked, attempting to auto-capture job data"
        );

        try {
          // Extract job data using the saved selectors
          const jobData = await extractJobDataFromMapping(mapping);

          if (jobData) {
            // Send to background script to save
            sendMessage("autoSaveFromSmartCapture", jobData);

            // Show success notification
            showNotification(
              `Auto-captured: ${jobData.position} at ${jobData.company}`,
              "success"
            );
          } else {
            console.warn("Failed to extract job data using saved selectors");
            showNotification("Failed to auto-capture job data", "warning");
          }
        } catch (error) {
          console.error("Error during auto-capture:", error);
          showNotification("Error during auto-capture", "error");
        }
      }
    },
    true
  ); // Use capture phase to catch events early
}

/**
 * Extract job data using saved Smart Capture selectors
 */
async function extractJobDataFromMapping(
  mapping: any
): Promise<Job_Application | null> {
  try {
    // Wait a moment for any dynamic content to load
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Extract job title
    const jobTitleElement = document.querySelector(mapping.jobTitleSelector);
    const jobTitle = jobTitleElement?.textContent?.trim() || "N/A";

    // Extract company name
    const companyElement = document.querySelector(mapping.companySelector);
    const companyName = companyElement?.textContent?.trim() || "N/A";

    // Generate unique ID
    const jobId = `auto-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    console.log("Extracted job data:", {
      title: jobTitle,
      company: companyName,
      url: window.location.href,
    });

    if (jobTitle === "N/A" && companyName === "N/A") {
      return null;
    }

    return {
      id: jobId,
      url: window.location.href,
      company: companyName,
      position: jobTitle,
      dateApplied: new Date().toISOString(),
      status: "Applied",
      notes: `Auto-captured via Smart Capture from ${mapping.domain}`,
    };
  } catch (error) {
    console.error("Error extracting job data from mapping:", error);
    return null;
  }
}

/**
 * Show notification to user
 */
function showNotification(
  message: string,
  type: "success" | "warning" | "error" = "success"
): void {
  const notification = document.createElement("div");
  notification.className = `smart-capture-notification ${type}`;

  const bgColors = {
    success: "rgba(34, 197, 94, 0.95)",
    warning: "rgba(245, 158, 11, 0.95)",
    error: "rgba(239, 68, 68, 0.95)",
  };

  notification.style.cssText = `
    position: fixed;
    top: 1rem;
    right: 1rem;
    background: ${bgColors[type]};
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    z-index: 999999;
    backdrop-filter: blur(2px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    max-width: 300px;
    word-wrap: break-word;
  `;

  notification.textContent = message;
  
  // Try to append to shadow root container, fall back to document.body
  const shadowContainer = document.getElementById(CONTENT_ROOT_ID);
  const targetContainer = shadowContainer || document.body;
  targetContainer.appendChild(notification);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 4000);
}

/**
 * Legacy function for LinkedIn-specific job extraction
 */
function getJobDetailsFromPage(): Job_Application {
  //the title is in h1 tag inside "a" element
  const jobTitleElement = document.querySelector("h1");
  const jobTitle = jobTitleElement
    ? jobTitleElement.textContent?.trim()
    : "N/A";

  //company name is in a tag with class "topcard__org-name-link"
  const companyElement = document.querySelector(
    ".job-details-jobs-unified-top-card__company-name a"
  );

  console.log("Company Element:", companyElement);
  const companyName = companyElement
    ? companyElement.textContent?.trim()
    : "N/A";

  const url = window.location.href;
  const jobId = extractJobIdFromUrl(url);

  return {
    id: jobId || "", // You might want to generate or extract a unique ID
    url: window.location.href,
    company: companyName || "N/A",
    position: jobTitle || "N/A",
    dateApplied: new Date().toISOString(),
    status: "Applied", // Default status, can be updated later
  };
}
