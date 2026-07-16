import type { Runtime } from "../schema";
import { LANG_BADGE } from "./labels";

export const runtimeText = (runtime: Runtime): string => {
  if (runtime.detail) return runtime.detail;
  const named = runtime.languages.filter((l) => l !== "none").map((l) => LANG_BADGE[l][1]);
  return named.length ? named.join(" + ") : "—";
};
