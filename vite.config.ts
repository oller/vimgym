import tailwindcss from "@tailwindcss/vite";
import { varlockVitePlugin } from "@varlock/vite-integration";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const commitHash = process.env.COMMIT_REF || "dev";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    // In dev, resolve workspace packages to their TypeScript source directly.
    // The "source" condition is set in packages/vimsplain/package.json exports.
    conditions: ["source"],
  },
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", { target: "19" }]],
      },
    }),
    tailwindcss(),
    varlockVitePlugin(),
  ],
});
