import { readFileSync } from "node:fs";
import { runVerification, summarise } from "./evidence-verify";

// Re-verify every source-code citation in the store against upstream: fetch the
// file at its pinned SHA and assert the quoted text is really there. A mismatch or
// an unparseable permalink is a hard failure (the citation is wrong); a fetch error
// is a soft warning (transient network), so this gate does not flake on an outage.
// Network-bound: runs in CI (evidence.yml), not the offline validate/pre-commit path.

const fetchText = async (url: string): Promise<string> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
};

const main = async (): Promise<void> => {
  const { tools } = JSON.parse(readFileSync("data/context-reduction-tools.json", "utf8")) as {
    tools: { id: string }[];
  };
  const results = await runVerification(tools, fetchText);
  for (const r of results) {
    const tag = r.status === "ok" ? "OK  " : r.status === "unfetchable" ? "WARN" : "FAIL";
    console.log(`${tag}  ${r.toolId}  ${r.url}${r.reason ? `  — ${r.reason}` : ""}`);
  }
  const { hard, soft } = summarise(results);
  console.log(
    `\n${results.length} source-code citations: ${hard.length} failed, ${soft.length} unreachable.`,
  );
  if (hard.length > 0) process.exit(1);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
