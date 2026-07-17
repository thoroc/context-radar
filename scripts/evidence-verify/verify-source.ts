import type { SourceCodeCitation } from "./collect-source-code";
import { matchQuote } from "./match-quote";
import { parsePermalink } from "./parse-permalink";

/**
 * `mismatch`/`unparseable` are hard failures (the citation is wrong); `unfetchable`
 * is soft (transient network), so CI does not flake on an upstream outage.
 */
export type VerifyStatus = "ok" | "mismatch" | "unparseable" | "unfetchable";

export interface VerifyResult {
  toolId: string;
  url: string;
  status: VerifyStatus;
  reason?: string;
}

/** Fetches a raw file by URL. Injected so the verifier stays unit-testable offline. */
export type FetchText = (url: string) => Promise<string>;

/**
 * Re-verify one source-code citation: parse its permalink, fetch the file at the
 * pinned SHA, and assert the quote appears in the cited line range. The fetcher is
 * injected so this is testable without network.
 */
export const verifySource = async (
  citation: SourceCodeCitation,
  fetchText: FetchText,
): Promise<VerifyResult> => {
  const { toolId, url } = citation;
  const parsed = parsePermalink(url);
  if (!parsed) {
    return { toolId, url, status: "unparseable", reason: "not a SHA-pinned permalink with #L" };
  }
  let text: string;
  try {
    text = await fetchText(parsed.rawUrl);
  } catch (err) {
    return { toolId, url, status: "unfetchable", reason: (err as Error).message };
  }
  const match = matchQuote(citation.quote, text, parsed.startLine, parsed.endLine);
  return match.ok
    ? { toolId, url, status: "ok" }
    : { toolId, url, status: "mismatch", reason: match.reason };
};
