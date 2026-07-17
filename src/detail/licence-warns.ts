import type { Tool } from "../lib";

// Non-permissive licence identifiers that get a warning treatment, matching the
// comparison table.
const LICENCE_WARN = new Set([
  "ELv2",
  "AGPL-3",
  "AGPL-3.0",
  "PolyForm Noncommercial",
  "PolyForm NC",
  "Source-available (commercial licence for distribution)",
  "Paid (commercial)",
]);

export const licenceWarns = (licence: Tool["licence"]): boolean => {
  return Boolean(licence.warning) || LICENCE_WARN.has(licence.spdx);
};
