import type { Tool } from "../../lib";

export const needsExternal = (t: Tool): boolean => t.requirements.trimStart().startsWith("⚠");
