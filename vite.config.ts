import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  // Mirrors public/_headers so local preview and CI serve the same protections.
  preview: {
    headers: {
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    },
  },
  plugins: [react(), mcpPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
