export const repoSlug = (): { owner: string; repo: string } => {
  const full = process.env.GITHUB_REPOSITORY;
  if (!full || !full.includes("/")) throw new Error("GITHUB_REPOSITORY (owner/repo) must be set");
  const [owner, repo] = full.split("/");
  return { owner, repo };
};
