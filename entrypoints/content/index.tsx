//import tailwind.css from assets
import "~/assets/tailwind.css";

import { CONTENT_ROOT_ID, Job_Application } from "@/utils/types";
import extractJobIdFromUrl from "@/utils/utils";
import { createRoot } from "react-dom/client";
import SmartCapture from "@/components/SmartCapture/SmartCapture";
import { SMARTCAPTUREDATA } from "@/utils/storageName";

export default defineContentScript({
  matches: ["<all_urls>"], // Changed to match all websites for Smart Capture
  cssInjectionMode: "ui",
  async main(ctx) {
    console.log("Content script loaded!", {
      id: browser.runtime.id,
      domain: window.location.hostname,
    });

    let appRoot: HTMLElement | null = null;
    let reactRoot: ReturnType<typeof createRoot> | null = null;
    const ui = await createShadowRootUi(ctx, {
      name: "career-tracker-root",
      position: "inline",
      anchor: "body",
      append: "first",
      mode: "closed",
      inheritStyles: false,
      onMount(container) {
        // Define how your UI will be mounted inside the container
        const app = document.createElement("div");
        app.id = CONTENT_ROOT_ID;
        // app.textContent = "Hello world!";
        appRoot = app;
        container.append(app);

        reactRoot = createRoot(appRoot);
      },
    });

    // 4. Mount the UI
    ui.mount();

    // Listen for existing job collection messages (LinkedIn specific)
    onMessage("CSgetDataFromJobCollection", async () => {
      if (window.location.hostname.includes("linkedin.com")) {
        const applyJobButton = document.querySelector("#jobs-apply-button-id");
        console.log("Apply Job Button:", applyJobButton);
        if (applyJobButton) {
          const data = getJobDetailsFromPage();
          applyJobButton.addEventListener("click", () => {
            console.log("Apply button clicked, extracted job data:", data);
            sendMessage("saveApplication", data);
          });
        } else {
          console.log("No job application button found on this page.");
          const smartCaptureStorage = await storage.getItem<
            SmartCaptureMapping[]
          >(`local:${SMARTCAPTUREDATA}`);
          console.log("Smart Capture Storage:", smartCaptureStorage);
        }
      }
    });

    let isOpen = true;

    function setOpenFromMsg(value: boolean) {
      isOpen = value;
      render();
    }

    function render() {
      if (reactRoot && appRoot) {
        reactRoot.render(
          <SmartCapture setIsOpen={setOpenFromMsg} isOpen={isOpen} />
        );
      }
    }

    // Listen for Smart Capture messages
    onMessage("startSmartCapture", () => {
      if (reactRoot && appRoot) {
        console.log("Rendering SmartCapture component");
        reactRoot.render(null); // Unmount previous instance
        setOpenFromMsg(true);
        // reactRoot.render(<SmartCapture />);
      }
    });

    onMessage("CSGetSmartCaptureMappings", async (msg) => {
      const { applyButtonSelector, jobTitleSelector, companySelector } =
        msg.data as SmartCaptureMapping;
      const jobTitleEl = getElementSelector({
        idName: jobTitleSelector.idName,
        className: jobTitleSelector.className,
      })?.textContent.trim();
      const companyEl = getElementSelector({
        idName: companySelector.idName,
        className: companySelector.className,
      })?.textContent.trim();

      const data: Job_Application = {
        id: extractJobIdFromUrl(window.location.href) || "",
        url: window.location.href,
        company: companyEl || "N/A",
        position: jobTitleEl || "N/A",
        dateApplied: new Date().toISOString(),
        status: "Applied", // Default status, can be updated later
      };

      getElementSelector({
        idName: applyButtonSelector.idName,
        className: applyButtonSelector.className,
      })?.addEventListener("click", () => {
        console.log("Apply button clicked, extracted job data:", data);
        sendMessage("saveApplication", data);
      });

      console.log("Smart Capture Elements:", {
        jobTitleEl,
        companyEl,
      });
    });
  },
});

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

function getElementSelector({
  idName,
  className,
}: {
  idName?: string;
  className: string;
}) {
  if (idName) {
    return document.getElementById(idName);
  } else if (className) {
    return document.getElementsByClassName(className)[0];
  }
}
