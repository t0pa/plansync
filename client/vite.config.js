import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ["plansync-frontend-app-j3mhf.ondigitalocean.app"],
    port: 8080,
    host: true,
  },
});
