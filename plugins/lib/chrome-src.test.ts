import { describe, expect, test } from "vitest";
import { chromeSrc, DEV_CHROME_SRC } from "./chrome-src";

const bundle = {
  "assets/lib-AAAA.js": {
    type: "chunk",
    isEntry: false,
    name: "lib",
    fileName: "assets/lib-AAAA.js",
  },
  "assets/chrome-BBBB.js": {
    type: "chunk",
    isEntry: true,
    name: "chrome",
    fileName: "assets/chrome-BBBB.js",
  },
  "index.html": { type: "asset", fileName: "index.html" },
} as const;

describe("chromeSrc", () => {
  test("resolves the hashed chunk and prefixes it with the page's base", () => {
    expect(chromeSrc(bundle, "../")).toBe("../assets/chrome-BBBB.js");
    expect(chromeSrc(bundle, "./")).toBe("./assets/chrome-BBBB.js");
  });

  // A silently-missing script is the failure mode worth guarding: the page
  // would still render, the theme toggle would just be a dead button on 86
  // pages, and nothing in the build would say so.
  test("throws when the chrome entry is absent from the bundle", () => {
    const withoutChrome = { "assets/lib-AAAA.js": bundle["assets/lib-AAAA.js"] };
    expect(() => chromeSrc(withoutChrome, "../")).toThrow(/chrome/i);
  });

  test("ignores a non-entry chunk that happens to share the name", () => {
    const decoy = {
      "assets/chrome-CCCC.js": {
        type: "chunk",
        isEntry: false,
        name: "chrome",
        fileName: "assets/chrome-CCCC.js",
      },
    };
    expect(() => chromeSrc(decoy, "./")).toThrow(/chrome/i);
  });

  test("exposes the dev-server source path, which needs no base", () => {
    expect(DEV_CHROME_SRC).toBe("/chrome/main.ts");
  });
});
