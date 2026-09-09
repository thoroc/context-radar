/** Headings below this count are not worth an aside; see MIN_HEADINGS' comment. */
const MIN_HEADINGS = 3;

const slug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Builds an on-this-page table of contents from an article's `h2`s and tracks
 * which one is in view.
 *
 * One mechanism for both places a document body is rendered: the standalone
 * page, and the comparison page's modal overlay, which swaps its content in
 * place. Mounting is therefore idempotent and safe to re-run.
 *
 * The floor exists because the page types are very uneven. Every tool page
 * carries 6 to 8 headings and methodology carries 9, but layer pages carry 2 to
 * 4 and nine of them carry exactly 2, while the glossary is one heading and a
 * definition list. A two-item aside is furniture, not navigation, so below the
 * floor the shell is marked `no-toc` and collapses to a single column.
 *
 * Active tracking uses IntersectionObserver where it exists, with `root` for
 * the modal, which scrolls inside itself rather than with the page. Where it
 * does not exist the links still work; only the highlight is absent.
 */
export const mountToc = (opts: {
  article: HTMLElement;
  nav: HTMLElement;
  root?: Element | null;
  minHeadings?: number;
}): boolean => {
  const { article, nav, root = null } = opts;
  const floor = opts.minHeadings ?? MIN_HEADINGS;
  const headings = [...article.querySelectorAll<HTMLElement>("h2")];
  const shell = article.closest("[data-doc-shell]");

  nav.replaceChildren();
  if (headings.length < floor) {
    shell?.classList.add("no-toc");
    return false;
  }
  shell?.classList.remove("no-toc");

  const used = new Set<string>();
  const links = new Map<string, HTMLAnchorElement>();
  for (const heading of headings) {
    let id = heading.id || slug(heading.textContent ?? "");
    if (id === "") id = "section";
    let unique = id;
    let n = 2;
    while (used.has(unique)) {
      unique = `${id}-${n}`;
      n += 1;
    }
    used.add(unique);
    heading.id = unique;

    const link = document.createElement("a");
    link.href = `#${unique}`;
    link.textContent = heading.textContent ?? "";
    nav.appendChild(link);
    links.set(unique, link);
  }

  if (typeof IntersectionObserver === "undefined") return true;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of links.values()) link.classList.remove("is-active");
        links.get(entry.target.id)?.classList.add("is-active");
      }
    },
    // Biased to the top of the scroll area so the highlighted entry is the one
    // whose section the reader has actually reached, not the last one to touch
    // the viewport's bottom edge.
    { root, rootMargin: "0px 0px -70% 0px", threshold: 0 },
  );
  for (const heading of headings) observer.observe(heading);
  return true;
};
