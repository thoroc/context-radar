import type { Tool } from "../schema";

export const licenceText = (licence: Tool["licence"]): string => licence.spdx;
