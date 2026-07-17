import { describe, expect, test } from "vitest";
import { sleep } from "./sleep";

describe("sleep", () => {
  test("resolves after the given delay", async () => {
    await expect(sleep(1)).resolves.toBeUndefined();
  });
});
