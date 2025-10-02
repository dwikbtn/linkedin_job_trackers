import React from "react";
import ReactDOM from "react-dom/client";
import "../../assets/tailwind.css";
import { JobApplicationsApp } from "./components/JobApplicationsApp";

ReactDOM.createRoot(document.getElementById("list-root")!).render(
  <React.StrictMode>
    <JobApplicationsApp />
  </React.StrictMode>
);
