import { describe, expect, test } from "vitest";
import { licenceClass } from "./licence-class";

describe("licenceClass", () => {
  test("buckets a permissive licence as open", () => {
    expect(licenceClass({ spdx: "MIT" })).toBe("open");
    expect(licenceClass({ spdx: "Apache-2.0" })).toBe("open");
  });

  test("buckets a non-permissive or caveated licence as warn", () => {
    expect(licenceClass({ spdx: "AGPL-3.0" })).toBe("warn");
    expect(licenceClass({ spdx: "MIT", warning: "no LICENSE file" })).toBe("warn");
  });

  test("buckets a no-licence or proprietary licence as paid", () => {
    expect(licenceClass({ spdx: "No licence (all rights reserved)" })).toBe("paid");
    expect(licenceClass({ spdx: "Apache-2.0 (launcher) + Proprietary (core)" })).toBe("paid");
  });

  test("paid takes precedence over warn", () => {
    expect(licenceClass({ spdx: "No licence", warning: "unclear" })).toBe("paid");
  });
});
