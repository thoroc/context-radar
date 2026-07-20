import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

// The page entry points import a build-time virtual module supplied by the
// markdown-pages Vite plugin. Tests do not load that plugin, so stub the module
// to an empty default export; this lets whole-project coverage include the
// entry points without running the real site build.
const stubVirtualPages = (): Plugin => {
  const id = "virtual:context-radar-pages";
  const resolved = `\0${id}`;
  return {
    name: "stub-virtual-pages",
    resolveId: (source) => (source === id ? resolved : null),
    load: (loadId) => (loadId === resolved ? "export default {}" : null),
  };
};

export default defineConfig({
  plugins: [stubVirtualPages()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "plugins/**/*.test.ts", "scripts/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // Count every source file, not just the ones a test imports, so the
      // percentage is a true whole-project figure.
      all: true,
      include: ["src/**/*.ts", "plugins/**/*.ts", "scripts/**/*.ts"],
      exclude: ["**/*.test.ts", "**/*.d.ts", "src/test-support/**"],
      reporter: ["text-summary", "text"],
      // The ratchet: autoUpdate raises these floors as coverage climbs (never
      // lowers them). CI fails if coverage drops below the committed floor.
      // Target: 85-90%.
      thresholds: {
        autoUpdate: true,
        lines: 51.02,
        functions: 66.78,
        branches: 52.58,
        statements: 51.66,
      },
    },
  },
});
