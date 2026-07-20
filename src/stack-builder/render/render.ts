import { CONFLICT_GRAPH } from "../constants";
import { conflictsFor } from "../model";
import { coveredLayers, getWarnedTools } from "../selectors";
import { state } from "../state";
import { renderGrid } from "./render-grid";
import { renderPanels } from "./render-panels";
import { renderSidebar } from "./render-sidebar";

export const render = (): void => {
  const report = conflictsFor(state.sel, CONFLICT_GRAPH);
  const warns = getWarnedTools();
  const covered = coveredLayers();
  renderGrid(report.conflictedIds);
  renderSidebar(report.conflictedIds, covered);
  renderPanels(report, warns, covered);
};
