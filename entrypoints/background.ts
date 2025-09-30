export default defineBackground(() => {
  console.log("Background script loaded!", { id: browser.runtime.id });

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
