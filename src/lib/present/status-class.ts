import type { ActivityBand } from "../schema";
import { BAND_CLASS } from "./labels";

export const statusClass = (band: ActivityBand): string => BAND_CLASS[band];
