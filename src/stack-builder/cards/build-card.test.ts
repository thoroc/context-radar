// @vitest-environment happy-dom
import { describe, expect, test, vi } from "vitest";
import { makeTool } from "../../test-support/make-tool";
import { CURATED_PICK_IDS } from "../constants";
import { buildCard } from "./build-card";

const curatedId = [...CURATED_PICK_IDS][0];

describe("buildCard", () => {
  test("renders a selectable checkbox card with the tool name and description", () => {
    const tool = makeTool({ tool: "MyTool", whatItDoes: "compresses output" });
    const card = buildCard(tool, false, false, () => {});
    expect(card.getAttribute("role")).toBe("checkbox");
    expect(card.getAttribute("aria-checked")).toBe("false");
    expect(card.getAttribute("tabindex")).toBe("0");
    expect(card.querySelector(".tname")?.textContent).toContain("MyTool");
    expect(card.querySelector(".tdesc")?.textContent).toBe("compresses output");
  });

  test("marks the selected state and shows the check icon", () => {
    const card = buildCard(makeTool(), true, false, () => {});
    expect(card.classList.contains("tc-sel")).toBe(true);
    expect(card.getAttribute("aria-checked")).toBe("true");
    expect(card.querySelector(".ti-check")).not.toBeNull();
  });

  test("marks the conflicted state", () => {
    const card = buildCard(makeTool(), false, true, () => {});
    expect(card.classList.contains("tc-conflict")).toBe(true);
  });

  test("is static (no checkbox role) when no activate handler is given", () => {
    const card = buildCard(makeTool(), false, false);
    expect(card.classList.contains("tc-static")).toBe(true);
    expect(card.getAttribute("role")).toBeNull();
    expect(card.querySelector(".ti-check")).toBeNull();
  });

  test("flags a tool needing external calls with the warn requirement class", () => {
    const warn = buildCard(makeTool({ requiresExternal: true }), false, false, () => {});
    expect(warn.querySelector(".treq-warn")).not.toBeNull();
    const ok = buildCard(makeTool({ requiresExternal: false }), false, false, () => {});
    expect(ok.querySelector(".treq-ok")).not.toBeNull();
  });

  test("exposes the full description and requirements as title tooltips", () => {
    const tool = makeTool({ whatItDoes: 'Rust "Context OS"', requirements: "needs a model" });
    const card = buildCard(tool, false, false, () => {});
    expect(card.querySelector<HTMLElement>(".tdesc")?.title).toBe('Rust "Context OS"');
    expect(card.querySelector<HTMLElement>(".treq")?.title).toBe("needs a model");
  });

  test("shows the built-in badge when the tool has no star count", () => {
    const card = buildCard(makeTool({ stars: null }), false, false, () => {});
    expect(card.querySelector(".tb-free")?.textContent).toBe("built-in");
  });

  test("shows the rec badge for a curated pick", () => {
    const card = buildCard(makeTool({ id: curatedId }), false, false, () => {});
    expect(card.querySelector(".tb-rec")?.textContent).toBe("rec");
  });

  test("shows no badge for a non-curated tool with stars", () => {
    const card = buildCard(makeTool({ id: "not-curated", stars: 10 }), false, false, () => {});
    expect(card.querySelector(".tc-badge")).toBeNull();
  });

  test("fires the activate handler on click and on Space/Enter", () => {
    const onActivate = vi.fn();
    const card = buildCard(makeTool(), false, false, onActivate);
    card.click();
    card.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    card.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    card.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(onActivate).toHaveBeenCalledTimes(3);
  });

  test("does not toggle the card when its GitHub link is clicked", () => {
    const onActivate = vi.fn();
    const card = buildCard(makeTool(), false, false, onActivate);
    card.querySelector("a")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onActivate).not.toHaveBeenCalled();
  });
});
