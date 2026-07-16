import pages from "virtual:context-radar-pages";
import { formatDisplayDate } from "../lib/columns";
import { META, TOOLS } from "../lib/data";
import { wirePageModals } from "../lib/modal";

function setText(id: string, text: string): void {
  const node = document.getElementById(id);
  if (node) node.textContent = text;
}

setText("toolcount", String(TOOLS.length));
setText("verified", formatDisplayDate(META.stars_verified));
wirePageModals(pages);
