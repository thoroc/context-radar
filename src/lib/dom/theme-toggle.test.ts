// @vitest-environment happy-dom
import { beforeEach, describe, expect, test } from "vitest";
import { initThemeToggle } from "./theme-toggle";

const setup = (matchesDark = false): void => {
  document.documentElement.removeAttribute("data-theme");
  localStorage.clear();
  document.body.innerHTML = '<button id="theme-toggle"></button>';
  window.matchMedia = ((query: string) => ({
    matches: matchesDark,
    media: query,
  })) as unknown as typeof window.matchMedia;
};

const btn = (): HTMLButtonElement => document.getElementById("theme-toggle") as HTMLButtonElement;

describe("initThemeToggle", () => {
  beforeEach(() => setup());

  test("is a no-op when the toggle button is absent", () => {
    document.body.innerHTML = "";
    expect(() => initThemeToggle()).not.toThrow();
  });

  test("paints the resolved OS theme, then toggles and persists on click", () => {
    initThemeToggle();
    expect(btn().innerHTML).toContain("<svg");
    expect(btn().dataset.mode).toBe("light");
    expect(btn().getAttribute("aria-label")).toBe("Switch to dark theme");

    btn().click();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(btn().dataset.mode).toBe("dark");
    expect(btn().getAttribute("aria-label")).toBe("Switch to light theme");

    btn().click();
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });

  test("honours a stored preference on init", () => {
    localStorage.setItem("theme", "dark");
    initThemeToggle();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(btn().dataset.mode).toBe("dark");
  });

  test("resolves dark from the OS media query when no preference is stored", () => {
    setup(true);
    initThemeToggle();
    expect(btn().dataset.mode).toBe("dark");
  });
});
