import { esc } from "./esc";

export const requirementsBlock = (requirements: string, requiresExternal: boolean): string => {
  const cls = requiresExternal ? "req-warn" : "req-ok";
  return `<div class="${cls}">${esc(requirements)}</div>`;
};
