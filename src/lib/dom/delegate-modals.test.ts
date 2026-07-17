// @vitest-environment happy-dom
import { beforeEach, describe, expect, test } from "vitest";
import { delegateModals } from "./delegate-modals";
import { wirePageModals } from "./wire-page-modals";

const clickFirstAnchor = (root: Element): MouseEvent => {
  const ev = new MouseEvent("click", { bubbles: true, cancelable: true });
  root.querySelector("a")?.dispatchEvent(ev);
  return ev;
};

describe("delegateModals", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("opens the modal for a known route and prevents navigation", () => {
    wirePageModals({ "tools/x.html": { title: "X", html: "<p>body-x</p>" } });
    const root = document.createElement("div");
    root.innerHTML = '<a href="tools/x.html">X</a>';
    document.body.appendChild(root);
    delegateModals(root);

    const ev = clickFirstAnchor(root);
    expect(ev.defaultPrevented).toBe(true);
    const body = document.querySelector("dialog.modal .modal-body");
    expect(body?.innerHTML).toContain("body-x");
  });

  test("leaves anchors that are not modal-backed alone", () => {
    wirePageModals({});
    const root = document.createElement("div");
    root.innerHTML = '<a href="https://example.com/">ext</a>';
    document.body.appendChild(root);
    delegateModals(root);

    const ev = clickFirstAnchor(root);
    expect(ev.defaultPrevented).toBe(false);
  });
});
