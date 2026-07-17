import type { Tool } from "../../src/lib";
import { esc } from "./esc";

export const activityParagraph = (tool: Tool): string => {
  const a = tool.activity;
  const parts: string[] = [];
  if (a.notes) parts.push(esc(a.notes));
  const facts: string[] = [];
  if (typeof a.contributors === "number") facts.push(`${a.contributors} contributors`);
  if (typeof a.releaseCount === "number") facts.push(`${a.releaseCount} releases`);
  if (a.latestVersion) facts.push(`latest ${esc(a.latestVersion)}`);
  if (a.releasedOn) facts.push(`released ${esc(a.releasedOn)}`);
  if (a.corroboration) facts.push(`corroborated via ${esc(a.corroboration)}`);
  if (facts.length) parts.push(facts.join(", "));
  return parts.length ? parts.map((p) => `<p>${p}</p>`).join("") : "<p>No activity notes.</p>";
};
