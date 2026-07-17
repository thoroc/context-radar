/** A source-code permalink parsed into a fetchable raw URL and its cited line range. */
export interface ParsedPermalink {
  rawUrl: string;
  startLine: number;
  endLine: number;
}

const LINE_ANCHOR = /#L(\d+)(?:-L?(\d+))?$/;

/**
 * Parse a source-code blob permalink into a raw-content URL and the cited line
 * range, for GitHub, GitLab, and Codeberg/Gitea. Returns null when the URL is not
 * a recognised SHA-pinned blob permalink with a line anchor. Mirrors the
 * SOURCE_CODE_PERMALINK rule in src/lib/schema.ts, so anything the schema accepts
 * parses here.
 */
export const parsePermalink = (url: string): ParsedPermalink | null => {
  const anchor = url.match(LINE_ANCHOR);
  if (!anchor) return null;
  const startLine = Number(anchor[1]);
  const endLine = anchor[2] ? Number(anchor[2]) : startLine;
  if (endLine < startLine) return null;
  const bare = url.slice(0, url.length - anchor[0].length);

  // GitHub / Gitea family: .../blob/<sha>/<path>
  const blob = bare.match(/^https?:\/\/([^/]+)\/(.+?)\/blob\/([0-9a-f]{7,40})\/(.+)$/i);
  if (blob) {
    const [, host, repo, sha, path] = blob;
    const rawUrl =
      host === "github.com"
        ? `https://raw.githubusercontent.com/${repo}/${sha}/${path}`
        : `https://${host}/${repo}/raw/${sha}/${path}`;
    return { rawUrl, startLine, endLine };
  }

  // GitLab: .../-/blob/<sha>/<path>
  const gitlab = bare.match(/^https?:\/\/([^/]+)\/(.+?)\/-\/blob\/([0-9a-f]{7,40})\/(.+)$/i);
  if (gitlab) {
    const [, host, repo, sha, path] = gitlab;
    return { rawUrl: `https://${host}/${repo}/-/raw/${sha}/${path}`, startLine, endLine };
  }

  // Codeberg / Gitea: .../src/commit/<sha>/<path>
  const commit = bare.match(/^https?:\/\/([^/]+)\/(.+?)\/src\/commit\/([0-9a-f]{7,40})\/(.+)$/i);
  if (commit) {
    const [, host, repo, sha, path] = commit;
    return { rawUrl: `https://${host}/${repo}/raw/commit/${sha}/${path}`, startLine, endLine };
  }

  return null;
};
