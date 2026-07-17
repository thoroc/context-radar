import type { VerifyResult } from "./verify-source";

/** Buckets of verification results plus the process exit code they imply. */
export interface VerificationSummary {
  ok: VerifyResult[];
  soft: VerifyResult[];
  hard: VerifyResult[];
  exitCode: 0 | 1;
}

/**
 * Bucket results and decide the exit code. Only a hard failure (a wrong or
 * unparseable citation) fails the gate; an unreachable source is a soft warning,
 * so CI does not flake on a transient upstream outage.
 */
export const summarise = (results: VerifyResult[]): VerificationSummary => {
  const ok = results.filter((r) => r.status === "ok");
  const soft = results.filter((r) => r.status === "unfetchable");
  const hard = results.filter((r) => r.status === "mismatch" || r.status === "unparseable");
  return { ok, soft, hard, exitCode: hard.length > 0 ? 1 : 0 };
};
