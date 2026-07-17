import { sleep } from "../lib/sleep";

export const api = async (
  method: string,
  path: string,
  body?: unknown,
  attempt = 0,
): Promise<{ status: number; json: unknown }> => {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "context-radar-freshness",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  // Honour secondary/abuse limits on bursts of writes, then back off, up to 3 tries.
  if ((res.status === 403 || res.status === 429) && attempt < 3) {
    const retryAfter = Number(res.headers.get("retry-after"));
    const reset = Number(res.headers.get("x-ratelimit-reset"));
    const remaining = res.headers.get("x-ratelimit-remaining");
    let waitMs = 3000 * 2 ** attempt;
    if (retryAfter) waitMs = retryAfter * 1000;
    else if (remaining === "0" && reset) waitMs = Math.max(0, reset * 1000 - Date.now()) + 1000;
    await sleep(waitMs);
    return api(method, path, body, attempt + 1);
  }
  return { status: res.status, json: res.status === 204 ? null : await res.json() };
};
