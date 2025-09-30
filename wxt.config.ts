import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: "Job Logger",
    description: "Log and track your job applications seamlessly.",
    version: "1.0.0",
    permissions: ["storage", "activeTab"],
    host_permissions: ["https://*.linkedin.com/*"],
  },
});
