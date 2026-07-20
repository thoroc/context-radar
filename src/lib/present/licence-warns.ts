import type { Tool } from "../schema";

// Non-permissive licence identifiers that get a warning treatment, shared by the
// comparison table, the tool detail, and the stack-builder licence bucket.
const LICENCE_WARN = new Set([
  "ELv2",
  "AGPL-3",
  "AGPL-3.0",
  "PolyForm Noncommercial",
  "PolyForm NC",
  "Source-available (commercial licence for distribution)",
  "Paid (commercial)",
]);

/** True when a licence is caveated or non-permissive and warrants a warning badge. */
export const licenceWarns = (licence: Tool["licence"]): boolean =>
  Boolean(licence.warning) || LICENCE_WARN.has(licence.spdx);
