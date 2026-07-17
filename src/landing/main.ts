import pages from "virtual:context-radar-pages";
import { formatDisplayDate, initThemeToggle, META, TOOLS, wirePageModals } from "../lib";
import { setText } from "./set-text";

setText("toolcount", String(TOOLS.length));
setText("verified", formatDisplayDate(META.stars_verified));
wirePageModals(pages);
initThemeToggle();
