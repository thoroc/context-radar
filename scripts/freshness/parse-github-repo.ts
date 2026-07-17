export const parseGithubRepo = (url: string): { owner: string; repo: string } | null => {
  const m = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, "") };
};
