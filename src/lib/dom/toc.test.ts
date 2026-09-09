// @vitest-environment happy-dom
import { beforeEach, describe, expect, test } from "vitest";
import { mountToc } from "./toc";

const shell = (headings: string[]): { article: HTMLElement; nav: HTMLElement } => {
  document.body.innerHTML = `<div class="doc-shell" data-doc-shell>
    <aside class="toc-shell"><nav data-toc></nav></aside>
    <article data-article>${headings.map((h) => `<section><h2>${h}</h2><p>x</p></section>`).join("")}</article>
  </div>`;
  return {
    article: document.querySelector("[data-article]") as HTMLElement,
    nav: document.querySelector("[data-toc]") as HTMLElement,
  };
};
const links = (): string[] =>
  [...document.querySelectorAll("[data-toc] a")].map((a) => a.textContent ?? "");

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("mountToc", () => {
  test("builds one link per heading, in order", () => {
    const { article, nav } = shell(["What it does", "Verdict", "Activity"]);
    expect(mountToc({ article, nav })).toBe(true);
    expect(links()).toEqual(["What it does", "Verdict", "Activity"]);
  });

  test("gives each heading an id and points its link at it", () => {
    const { article, nav } = shell(["What it does", "Verdict", "Activity"]);
    mountToc({ article, nav });
    const first = article.querySelector("h2") as HTMLElement;
    expect(first.id).toBe("what-it-does");
    expect(document.querySelector("[data-toc] a")?.getAttribute("href")).toBe("#what-it-does");
  });

  test("keeps ids unique when two headings share a title", () => {
    const { article, nav } = shell(["Notes", "Notes", "Notes"]);
    mountToc({ article, nav });
    const ids = [...article.querySelectorAll("h2")].map((h) => h.id);
    expect(new Set(ids).size).toBe(3);
  });

  // Layer pages carry 2 to 4 headings and the thinnest have exactly 2, so
  // without a floor nine of them would show a two-item aside. Tool pages all
  // carry at least 6, so they are never affected.
  test("refuses to mount below the heading floor, and marks the shell", () => {
    const { article, nav } = shell(["How many to install", "Where to start"]);
    expect(mountToc({ article, nav })).toBe(false);
    expect(links()).toEqual([]);
    expect(document.querySelector("[data-doc-shell]")?.classList.contains("no-toc")).toBe(true);
  });

  test("mounts at exactly the floor", () => {
    const { article, nav } = shell(["a", "b", "c"]);
    expect(mountToc({ article, nav, minHeadings: 3 })).toBe(true);
  });

  test("handles a page with no headings at all, as the glossary has", () => {
    const { article, nav } = shell([]);
    expect(mountToc({ article, nav })).toBe(false);
    expect(document.querySelector("[data-doc-shell]")?.classList.contains("no-toc")).toBe(true);
  });

  // The modal swaps its content in place when a link points at another
  // modal-backed page, so mounting runs more than once against the same nav.
  test("is idempotent: a second mount does not double the list", () => {
    const { article, nav } = shell(["One", "Two", "Three"]);
    mountToc({ article, nav });
    mountToc({ article, nav });
    expect(links()).toEqual(["One", "Two", "Three"]);
  });

  test("clears the no-toc marker when a re-mount does have enough headings", () => {
    const thin = shell(["a", "b"]);
    mountToc(thin);
    expect(document.querySelector("[data-doc-shell]")?.classList.contains("no-toc")).toBe(true);
    const fat = shell(["a", "b", "c"]);
    mountToc(fat);
    expect(document.querySelector("[data-doc-shell]")?.classList.contains("no-toc")).toBe(false);
  });
});
