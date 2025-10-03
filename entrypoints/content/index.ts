//import tailwind.css from assets

import { Job_Application } from "@/utils/types";
import extractJobIdFromUrl from "@/utils/utils";

export default defineContentScript({
  matches: ["https://*.linkedin.com/*"],
  main(ctx) {
    console.log("Content script loaded on LinkedIn!", {
      id: browser.runtime.id,
    });

    onMessage("CSgetDataFromJobCollection", () => {
      // Example: Extract job title from the page
      console.log("CSgetDataFromJobCollection message received");
      // const tempJobData: Job_Application;

      const applyJobButton = document.querySelector("#jobs-apply-button-id");
      if (applyJobButton) {
        const data = getJobDetailsFromPage();
        //add button listeners
        applyJobButton.addEventListener("click", () => {
          console.log("Apply button clicked, extracted job data:", data);
          // Send the extracted job data to the background script
          sendMessage("saveApplication", data);
        });
      } else {
        console.log("No job application button found on this page.");
      }
    });
  },
});

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
