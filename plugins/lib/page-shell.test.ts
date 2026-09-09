import { describe, expect, test } from "vitest";
import { pageShell } from "./page-shell";

const opts = {
  title: "Code navigation",
  styles: ".x{color:red}",
  base: "../",
  active: "layers.html",
  chromeSrc: "../assets/chrome-A.js",
  body: "<h1>hi</h1>",
};

describe("pageShell", () => {
  test("carries the title, the styles and the body", () => {
    const html = pageShell(opts);
    expect(html).toContain("<title>Code navigation — Context Radar</title>");
    expect(html).toContain(".x{color:red}");
    expect(html).toContain("<h1>hi</h1>");
  });

  test("renders the shared top bar exactly once, with the caller's base", () => {
    const html = pageShell(opts);
    expect(html.split('data-chrome="v1"').length - 1).toBe(1);
    expect(html).toContain('href="../index.html"');
  });

  // Generated pages get no script from Rollup, so the shell has to reference
  // the shared chunk itself or the theme toggle is a dead control.
  test("references the shared chunk exactly once", () => {
    const html = pageShell(opts);
    expect(html.split("<script").length - 1).toBe(1);
    expect(html).toContain('src="../assets/chrome-A.js"');
  });

  test("escapes the title", () => {
    expect(pageShell({ ...opts, title: 'a "b" & <c>' })).toContain(
      "a &quot;b&quot; &amp; &lt;c&gt;",
    );
  });
});
