import pages from "virtual:context-radar-pages";
import { formatDisplayDate, META, TOOLS, wirePageModals } from "../lib";

function setText(id: string, text: string): void {
  const node = document.getElementById(id);
  if (node) node.textContent = text;
}

setText("toolcount", String(TOOLS.length));
setText("verified", formatDisplayDate(META.stars_verified));
wirePageModals(pages);
