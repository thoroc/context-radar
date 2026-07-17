import { esc } from "./esc";

export const requirementsBlock = (requirements: string): string => {
  const warn = requirements.trimStart().startsWith("⚠");
  const cls = warn ? "req-warn" : "req-ok";
  const mark = warn ? "⚠" : "✓";
  return `<div class="${cls}">${mark} ${esc(requirements)}</div>`;
};
