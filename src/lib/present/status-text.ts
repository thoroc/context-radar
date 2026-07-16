import type { Tool } from "../schema";
import { BAND_EMOJI } from "./labels";

export const statusText = (status: Tool["activityStatus"]): string =>
  `${BAND_EMOJI[status.band]} ${status.label}`.trim();
