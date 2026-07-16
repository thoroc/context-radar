import type { Tool } from "../schema";
import { conflictText } from "./conflict-text";
import { runtimeText } from "./runtime-text";
import { statusText } from "./status-text";
import { verdictText } from "./verdict-text";

/** Lowercased haystack of every human-readable value, for the search box. */
export const searchText = (t: Tool): string => {
  const a = t.activity;
  return [
    t.tool,
    t.layer,
    t.whatItDoes,
    conflictText(t.conflict),
    runtimeText(t.runtime),
    t.requirements,
    t.licence.spdx,
    t.licence.warning ?? "",
    a.notes ?? "",
    a.corroboration ?? "",
    a.latestVersion ?? "",
    statusText(t.activityStatus),
    verdictText(t.verdict),
    t.decisionRule,
  ]
    .join(" ")
    .toLowerCase();
};
