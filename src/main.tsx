import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "react-hot-toast";
import AuthProvider from "./providers/AuthProvider.tsx";
import axios from "axios";
import { MantineProvider } from "@mantine/core";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <MantineProvider theme={{ fontFamily: "Inter, sans-serif" }}>
      <AuthProvider>
        <Toaster />

        <App />
      </AuthProvider>
    </MantineProvider>
  </BrowserRouter>,
);
