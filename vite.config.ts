import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "favicon-admin.svg"],
      manifest: {
        name: "Aromático Café",
        short_name: "Aromático",
        description: "Panel administrativo y punto de venta",
        theme_color: "#0f0d0b",
        background_color: "#0f0d0b",
        display: "standalone",
        start_url: "/dashboard",
        scope: "/",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2,png}"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/rest\//, /^\/auth\//],
        runtimeCaching: [
          {
            // Supabase reads (GET): network first, cache as offline fallback
            urlPattern: ({ url, request }) =>
              url.hostname.endsWith(".supabase.co") &&
              url.pathname.startsWith("/rest/") &&
              request.method === "GET",
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-data",
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
