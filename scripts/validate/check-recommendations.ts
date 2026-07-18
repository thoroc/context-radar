import { hasConfirmedSourceEvidence } from "../../src/lib";
import type { Recommendation, Tool } from "../../src/lib/schema";

/**
 * Cross-store checks for the recommendations file that the Zod schema cannot make
 * because it cannot see the tool store: every member exists and sits in the
 * recommendation's layer; the pick holds a `best`/`either-or` verdict; every member
 * carries source-verified verdict evidence (the Phase 2 gate that holds a
 * recommendation back until its tools are cited); member sets are disjoint per
 * layer; and recommendation ids are unique. Returns a list of human-readable
 * errors, empty when the file is consistent with the store.
 */
export const checkRecommendations = (tools: Tool[], recs: Recommendation[]): string[] => {
  const errors: string[] = [];
  const byId = new Map(tools.map((t) => [t.id, t]));

  const claimedByLayer = new Map<string, Map<string, string>>();

  for (const rec of recs) {
    const where = `recommendation '${rec.id}'`;

    for (const memberId of rec.members) {
      const tool = byId.get(memberId);
      if (!tool) {
        errors.push(`${where}: member '${memberId}' is not a known tool id`);
        continue;
      }
      if (tool.layer !== rec.layer) {
        errors.push(
          `${where}: member '${memberId}' is in layer '${tool.layer}', not '${rec.layer}'`,
        );
      }
      if (!hasConfirmedSourceEvidence(tool)) {
        errors.push(
          `${where}: member '${memberId}' lacks confirmed source-code verdict evidence (Phase 2 gate)`,
        );
      }
    }

    const pick = byId.get(rec.pick);
    if (pick && pick.verdict.decision !== "best" && pick.verdict.decision !== "either-or") {
      errors.push(
        `${where}: pick '${rec.pick}' has verdict '${pick.verdict.decision}', must be 'best' or 'either-or'`,
      );
    }

    let claimed = claimedByLayer.get(rec.layer);
    if (!claimed) {
      claimed = new Map();
      claimedByLayer.set(rec.layer, claimed);
    }
    for (const memberId of rec.members) {
      const other = claimed.get(memberId);
      if (other) {
        errors.push(
          `${where}: member '${memberId}' also appears in '${other}' for layer '${rec.layer}' (must be disjoint)`,
        );
      } else {
        claimed.set(memberId, rec.id);
      }
    }
  }

  const ids = recs.map((r) => r.id);
  if (new Set(ids).size !== ids.length) {
    errors.push("recommendation ids must be unique");
  }

  return errors;
};
