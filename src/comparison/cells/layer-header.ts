import { CARDINALITY_LABEL, type LayerSection } from "../../lib";
import { escapeHtml } from "../dom";

/**
 * The full-width heading row that opens each section of the comparison table.
 *
 * A section holding one layer shows that layer's guidance note. A section
 * holding several names each member and its cardinality instead, because one
 * heading over two layers would otherwise imply a single selection rule for
 * both -- `Shell output` is pick-one and `All tool output` is stackable, and a
 * reader deciding what to install needs to see that they differ.
 */
export const layerHeader = (section: LayerSection): string => {
  const note =
    section.layers.length === 1
      ? (section.layers[0].note ?? "")
      : section.layers.map((l) => `${l.name}: ${CARDINALITY_LABEL[l.cardinality]}`).join(" · ");
  const noteHtml = note ? `<span class="lh-note">${escapeHtml(note)}</span>` : "";
  return `${escapeHtml(section.heading)}${noteHtml}`;
};
