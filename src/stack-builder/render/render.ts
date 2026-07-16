import { coveredLayers, getConflictedIds, getConflicts, getWarnedTools } from "../selectors";
import { renderGrid } from "./render-grid";
import { renderPanels } from "./render-panels";
import { renderSidebar } from "./render-sidebar";

export const render = (): void => {
  const cIds = getConflictedIds();
  const conf = getConflicts();
  const warns = getWarnedTools();
  const covered = coveredLayers();
  renderGrid(cIds);
  renderSidebar(cIds, covered);
  renderPanels(conf, warns, covered);
};
