import { describe, expect, test } from "vitest";
import type { SourceCodeCitation } from "./collect-source-code";
import { verifySource } from "./verify-source";

const sha = "f14b3bb5d70256211d094aced9a48c7018355dd5";
const citation = (over: Partial<SourceCodeCitation> = {}): SourceCodeCitation => ({
  toolId: "alpha",
  url: `https://github.com/o/r/blob/${sha}/a.rs#L1-L2`,
  quote: "hello world",
  checkedOn: "2026-07-16",
  ...over,
});

describe("verifySource", () => {
  test("ok when the quote is present at the pinned range", async () => {
    const r = await verifySource(citation(), async () => "hello world\nsecond line");
    expect(r.status).toBe("ok");
  });

  test("mismatch when the quote is absent", async () => {
    const r = await verifySource(citation(), async () => "totally different\ncontent");
    expect(r.status).toBe("mismatch");
  });

  test("unparseable when the URL is not a SHA permalink", async () => {
    const r = await verifySource(
      citation({ url: "https://github.com/o/r/blob/main/a.rs" }),
      async () => "x",
    );
    expect(r.status).toBe("unparseable");
  });

  test("unfetchable (soft) when the fetch throws", async () => {
    const r = await verifySource(citation(), async () => {
      throw new Error("HTTP 500");
    });
    expect(r.status).toBe("unfetchable");
    expect(r.reason).toBe("HTTP 500");
  });
});
