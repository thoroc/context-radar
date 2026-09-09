/**
 * The site's top-level destinations, in bar order. The single source of truth:
 * before this list existed the same five links were copy-pasted into three
 * static HTML entries and the tool-pages plugin, so adding a destination meant
 * four edits and remembering which of them needed a `../` prefix.
 *
 * Hrefs are base-relative and carry no leading separator; `renderTopbar`
 * prefixes them with the caller's base so one list serves root pages (`./`) and
 * nested tool and layer pages (`../`).
 */
export const NAV_LINKS: readonly { href: string; label: string }[] = [
  { href: "index.html", label: "Home" },
  { href: "comparison.html", label: "Comparison" },
  { href: "stack-builder.html", label: "Stack builder" },
  { href: "methodology.html", label: "Methodology" },
  { href: "glossary.html", label: "Glossary" },
];
