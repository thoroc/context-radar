import { coveredLayers, getConflictedIds, getConflicts, getWarnedTools } from "../selectors";
import { renderGrid } from "./renderGrid";
import { renderPanels } from "./renderPanels";
import { renderSidebar } from "./renderSidebar";

export const render = (): void => {
  const cIds = getConflictedIds();
  const conf = getConflicts();
  const warns = getWarnedTools();
  const covered = coveredLayers();
  renderGrid(cIds);
  renderSidebar(cIds, covered);
  renderPanels(conf, warns, covered);
};
