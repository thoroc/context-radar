import type { Tool } from "../../lib";

export const isDrop = (t: Tool): boolean => t.verdict.decision === "drop";
