import { defineConfig } from "vite";
import { readFileSync } from "node:fs";

export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "include-project-readme",
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "README.md",
          source: readFileSync(new URL("./README.md", import.meta.url), "utf8"),
        });
      },
    },
  ],
});
