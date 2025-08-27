// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import { CampaignsProvider } from "./context/CampaignsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CampaignsProvider>
      <App />
    </CampaignsProvider>
  </React.StrictMode>
);
