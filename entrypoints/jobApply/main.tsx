import React from "react";
import ReactDOM from "react-dom/client";
import JobApplicationsApp from "./Components/JobApplicationsApp";
import "../../assets/tailwind.css";

ReactDOM.createRoot(document.getElementById("list-root")!).render(
  <React.StrictMode>
    <JobApplicationsApp />
  </React.StrictMode>
);
