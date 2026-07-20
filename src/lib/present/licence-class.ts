import type { Tool } from "../schema";
import { licenceWarns } from "./licence-warns";

/** Licence markers granting no free use: proprietary, or no licence at all. */
const PAID = /no licence|all rights reserved|proprietary/i;

/**
 * Bucket a licence into a badge class: `paid` when the licence grants no free
 * use (proprietary or no licence), `warn` for a caveated or non-permissive
 * licence (the same rule as the comparison table and tool detail, via
 * licenceWarns), and `open` otherwise. Precedence is paid, then warn, then open.
 */
export const licenceClass = (licence: Tool["licence"]): "open" | "warn" | "paid" => {
  if (PAID.test(licence.spdx)) return "paid";
  if (licenceWarns(licence)) return "warn";
  return "open";
};
