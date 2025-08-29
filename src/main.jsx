// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// ✅ Providers
import { AuthProvider } from "./context/AuthContext";
import { CampaignsProvider } from "./context/CampaignsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CampaignsProvider>
        <App />
      </CampaignsProvider>
    </AuthProvider>
  </React.StrictMode>
);
