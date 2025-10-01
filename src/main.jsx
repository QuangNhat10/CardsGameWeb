import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import apiService from "./services/api";

// Startup diagnostic log
try { console.log("[env] VITE_API_URL=", import.meta?.env?.VITE_API_URL, "| URL=", apiService.baseURL); } catch { }

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
