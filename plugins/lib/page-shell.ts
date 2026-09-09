import { esc } from "../../src/detail";
import { renderTopbar } from "../../src/lib/chrome";

/**
 * The HTML envelope every generated page shares: head, inlined styles, the
 * shared top bar, the body, and the reference to the shared chrome chunk.
 *
 * Extracted before the layer-page generator was written rather than after.
 * These pages are emitted as raw asset strings, so each generator would
 * otherwise hand-roll the same doctype, head, bar and script tag, and the
 * project's own duplication gate would be right to flag the second copy.
 */
export const pageShell = (opts: {
  title: string;
  styles: string;
  base: string;
  active: string;
  chromeSrc: string;
  body: string;
}): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(opts.title)} — Context Radar</title>
<style>${opts.styles}</style>
</head>
<body>
    ${renderTopbar({ base: opts.base, active: opts.active })}
${opts.body}
<script type="module" src="${opts.chromeSrc}"></script>
</body>
</html>
`;
