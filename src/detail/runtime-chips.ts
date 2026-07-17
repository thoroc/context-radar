import { LANG_BADGE, type Tool } from "../lib";
import { esc } from "./esc";

export const runtimeChips = (runtime: Tool["runtime"]): string => {
  const named = runtime.languages.filter((l) => l !== "none");
  if (!named.length) return `<span class="rt">${esc(runtime.detail ?? "—")}</span>`;
  return named.map((l) => `<span class="rt">${esc(LANG_BADGE[l][1])}</span>`).join(" ");
};
