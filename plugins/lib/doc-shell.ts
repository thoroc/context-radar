/**
 * The document-shell markup the generated pages share: a sticky table of
 * contents beside the article.
 *
 * The nav is emitted empty and filled at runtime by `mountToc`, which needs the
 * rendered headings. With JavaScript off the aside is an empty box, so
 * doc-shell.css gives it no border or background of its own.
 *
 * `measure` is opt-in, for articles that are one column of prose. The tool and
 * layer pages are not: their article splits into a main column and a facts
 * panel, so capping the whole article caps the pair, and the prose column ends
 * up narrower than it was before the shell existed. Their measure comes from
 * that inner main column instead.
 */
export const docShell = (opts: {
  body: string;
  articleClass: string;
  measure?: boolean;
}): string => `<div class="doc-shell" data-doc-shell>
    <aside class="toc-shell">
      <p class="toc-label">On this page</p>
      <nav data-toc aria-label="On this page"></nav>
    </aside>
    <article data-article class="${opts.articleClass}${opts.measure ? " prose-measure" : ""}">${opts.body}</article>
  </div>`;
