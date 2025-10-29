import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Optimizări pentru performanță și mobile
  build: {
    // Target pentru compatibilitate maximă
    target: "es2015",

    // Minificare optimizată
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
    } as any, // Type assertion pentru compatibilitate

    // Optimizare pentru assets
    assetsInlineLimit: 2048, // Redus pentru încărcare mai rapidă
    chunkSizeWarningLimit: 1000, // Warning pentru chunks mari

    // Code splitting optimizat
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks pentru caching mai bun
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            if (id.includes("firebase")) {
              return "firebase-vendor";
            }
            if (id.includes("react-router")) {
              return "router-vendor";
            }
            if (id.includes("react-icons")) {
              return "icons-vendor";
            }
            return "vendor";
          }
        },
        // Optimizare pentru nume de fișiere
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },

    // Optimizări pentru source maps
    sourcemap: false, // Dezactivat pentru production
  },

  // Optimizări pentru development
  server: {
    host: true,
    port: 5173,
    // Optimizare pentru hot reload
    hmr: {
      overlay: false, // Dezactivează overlay-ul pentru performanță
    },
  },

  // Optimizare pentru CSS
  css: {
    devSourcemap: true,
  },

  // Optimizări pentru dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "firebase/app",
      "firebase/auth",
      "firebase/firestore",
      "react-icons/fi",
    ],
  },

  // Optimizări pentru preview
  preview: {
    port: 4173,
    host: true,
  },
});
