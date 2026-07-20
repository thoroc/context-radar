import {
  DECISION_LABEL,
  formatDisplayDate,
  licenceWarns,
  RECOMMENDATIONS,
  starsText,
  statusText,
  TOOLS_BY_ID,
  type Tool,
  verdictClass,
} from "../lib";
import { activityParagraph } from "./activity-paragraph";
import { conflictBlock } from "./conflict-block";
import { esc } from "./esc";
import { evidenceSection } from "./evidence-section";
import { recommendationBlock } from "./recommendation-block";
import { requirementsBlock } from "./requirements-block";
import { runtimeChips } from "./runtime-chips";
import { trendCell } from "./trend-cell";
import type { DetailContext } from "./types";

/**
 * The inner detail content for one tool: the header, the two-column body, and
 * the facts panel. Shared by the standalone `/tools/*.html` page (wrapped in
 * `.tool-detail` inside the page chrome) and the comparison-page modal overlay
 * (wrapped in `.tool-detail.tool-detail--modal`). Internal links are prefixed
 * with `ctx.base` so they resolve from either mount point.
 */
export const renderDetailBody = (tool: Tool, ctx: DetailContext): string => {
  const { slugByName, base, starsVerified } = ctx;
  const verified = formatDisplayDate(starsVerified);
  return `<div class="head">
    <h1>${esc(tool.tool)}</h1>
    <span class="verdict ${verdictClass(tool.verdict.decision)}">${esc(DECISION_LABEL[tool.verdict.decision])}</span>
  </div>
  <p class="headsub"><span class="layer">${esc(tool.layer)}</span></p>
  <div class="cols">
    <div class="main">
      <section><h2>What it does</h2><p class="lede">${esc(tool.whatItDoes)}</p></section>
      <section><h2>Verdict</h2><div class="callout"><span class="verdict ${verdictClass(tool.verdict.decision)}">${esc(DECISION_LABEL[tool.verdict.decision])}</span>${tool.verdict.rationale ? `<p class="rationale">${esc(tool.verdict.rationale)}</p>` : ""}</div></section>
      ${recommendationBlock(tool, RECOMMENDATIONS, TOOLS_BY_ID, base)}
      <section><h2>Decision rule</h2><div class="rule-box">${esc(tool.decisionRule)}</div></section>
      <section><h2>Conflicts &amp; overlap</h2>${conflictBlock(tool, slugByName, base)}</section>
      <section><h2>Requirements</h2>${requirementsBlock(tool.requirements, tool.requiresExternal)}</section>
      <section><h2>Activity</h2>${activityParagraph(tool)}</section>
      ${evidenceSection(tool)}
    </div>
    <aside>
      <div class="facts">
        <div class="row"><span class="k">Layer</span><span class="v">${esc(tool.layer)}</span></div>
        <div class="row"><span class="k">Runtime</span><span class="v">${runtimeChips(tool.runtime)}</span></div>
        <div class="row"><span class="k">Licence</span><span class="v ${licenceWarns(tool.licence) ? "lic-warn" : ""}">${esc(tool.licence.spdx)}</span></div>
        <div class="row"><span class="k">Stars</span><span class="v">${esc(starsText(tool.stars))}${trendCell(tool.trend)}</span></div>
        <div class="row"><span class="k">Activity</span><span class="v"><span class="act"><span class="dot dot-${tool.activityStatus.band}"></span>${esc(statusText(tool.activityStatus))}</span></span></div>
        <div class="row"><span class="k">Verified</span><span class="v">${esc(verified)}</span></div>
        <div class="actions">
          <a class="btn accent" href="${esc(tool.githubUrl)}" target="_blank" rel="noopener">View on GitHub ↗</a>
          <a class="btn" href="${base}stack-builder.html">Open stack builder</a>
        </div>
      </div>
    </aside>
  </div>`;
};
