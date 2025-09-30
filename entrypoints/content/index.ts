//import tailwind.css from assets

export default defineContentScript({
  matches: ["https://*.linkedin.com/*"],
  main(ctx) {
    console.log("Content script loaded on LinkedIn!", {
      id: browser.runtime.id,
    });
    console.log("Context:", ctx);
  },
});
