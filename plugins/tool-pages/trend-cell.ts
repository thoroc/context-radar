import { trendText } from "../../src/lib";
import { esc } from "./esc";

export const trendCell = (trend: number | null): string => {
  if (trend === null) return "";
  const cls = trend > 0 ? "trend-up" : trend < 0 ? "trend-down" : "trend-flat";
  return ` <span class="${cls}">${esc(trendText(trend))}</span>`;
};
