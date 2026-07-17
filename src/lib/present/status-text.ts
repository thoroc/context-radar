import type { Tool } from "../schema";

export const statusText = (status: Tool["activityStatus"]): string => status.label;
