import { sleep } from "../lib/sleep";
import { maxParseableTag } from "./max-parseable-tag";

// GitHub fetch layer (rate-limit aware). The token and helpers live here, the
// module that talks to the API; `run` imports them from this module.
export const TOKEN = process.env.GITHUB_TOKEN;
const MAX_TAG_PAGES = 5; // 500 tags; capped runs are reported, never silent
export const REQUEST_SPACING_MS = 150;

interface FetchResult {
  status: number;
  headers: Headers;
  json: unknown;
}

const ghFetch = async (path: string, attempt = 0): Promise<FetchResult> => {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "context-radar-freshness",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  // Secondary/abuse limits (403/429) and primary exhaustion: honour Retry-After /
  // x-ratelimit-reset, then back off exponentially, up to 3 attempts.
  if ((res.status === 403 || res.status === 429) && attempt < 3) {
    const retryAfter = Number(res.headers.get("retry-after"));
    const reset = Number(res.headers.get("x-ratelimit-reset"));
    const remaining = res.headers.get("x-ratelimit-remaining");
    let waitMs = 2000 * 2 ** attempt;
    if (retryAfter) waitMs = retryAfter * 1000;
    else if (remaining === "0" && reset) waitMs = Math.max(0, reset * 1000 - Date.now()) + 1000;
    await sleep(waitMs);
    return ghFetch(path, attempt + 1);
  }
  return {
    status: res.status,
    headers: res.headers,
    json: res.status === 204 ? null : await res.json(),
  };
};

/** Observe the latest upstream version: releases/latest, then paginated tags. */
export const observeUpstream = async (
  owner: string,
  repo: string,
): Promise<{ version: string | null; source: string; capped: boolean }> => {
  const rel = await ghFetch(`/repos/${owner}/${repo}/releases/latest`);
  if (rel.status === 200) {
    const tag = (rel.json as { tag_name?: string }).tag_name;
    if (tag) return { version: tag, source: "releases/latest", capped: false };
  }
  if (rel.status !== 200 && rel.status !== 404) {
    throw new Error(`releases/latest -> HTTP ${rel.status}`);
  }
  // Fall through to tags (the endpoint is NOT newest-first, so page and take the max).
  const allTags: string[] = [];
  let capped = false;
  for (let page = 1; page <= MAX_TAG_PAGES; page++) {
    await sleep(REQUEST_SPACING_MS);
    const res = await ghFetch(`/repos/${owner}/${repo}/tags?per_page=100&page=${page}`);
    if (res.status === 404) break;
    if (res.status !== 200) throw new Error(`tags -> HTTP ${res.status}`);
    const names = (res.json as Array<{ name: string }>).map((t) => t.name);
    allTags.push(...names);
    if (names.length < 100) break;
    if (page === MAX_TAG_PAGES) capped = true;
  }
  const best = maxParseableTag(allTags);
  return { version: best ? best.tag : null, source: allTags.length ? "tags" : "none", capped };
};
