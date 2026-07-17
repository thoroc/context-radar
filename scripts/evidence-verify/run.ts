import { collectSourceCode } from "./collect-source-code";
import { type FetchText, type VerifyResult, verifySource } from "./verify-source";

/**
 * Collect every source-code citation from the tools and re-verify each against
 * upstream. Pure orchestration: the fetcher is injected, so this is testable
 * offline and the thin entry (verify-evidence.ts) only wires real fetch + I/O.
 */
export const runVerification = (
  tools: { id: string }[],
  fetchText: FetchText,
): Promise<VerifyResult[]> =>
  Promise.all(collectSourceCode(tools).map((c) => verifySource(c, fetchText)));
