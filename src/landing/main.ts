import pages from "virtual:context-radar-pages";
import { formatDisplayDate, META, TOOLS, wirePageModals } from "../lib";
import { setText } from "./setText";

setText("toolcount", String(TOOLS.length));
setText("verified", formatDisplayDate(META.stars_verified));
wirePageModals(pages);
