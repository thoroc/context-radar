---
name: Context Radar
description: Comparison catalogue of context-reduction tools for coding agents.
colors:
  ink: "#17161a"
  ink-muted: "#56545e"
  ink-subtle: "#67656f"
  bg: "#ffffff"
  surface: "#f6f5f3"
  surface-deep: "#edece8"
  border: "#17161a1a"
  border-strong: "#17161a33"
  accent: "#534ab7"
  accent-soft: "#eeedfe"
  accent-border: "#7f77dd"
  green: "#27500a"
  green-soft: "#eaf3de"
  amber: "#7a4a06"
  amber-soft: "#faeeda"
  red: "#8a2020"
  red-soft: "#fcebeb"
  gray: "#4a4844"
  gray-soft: "#f0efe9"
  dot-active: "#3f9142"
  dot-stable: "#c88a1a"
  dot-slowing: "#d97706"
  dot-early: "#c04141"
  dot-dormant: "#9b99a2"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "18px"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.05em"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13px"
rounded:
  xs: "3px"
  sm: "5px"
  md: "8px"
  lg: "12px"
  xl: "14px"
  pill: "20px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "24px"
components:
  button-accent:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    rounded: "{rounded.md}"
    padding: "7px 14px"
  button-ghost:
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.md}"
    padding: "7px 14px"
  verdict-pill:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  chip:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: Context Radar

## 1. Overview

<!-- markdownlint-disable MD036 -- DESIGN.md spec mandates the emphasised North Star line -->

**Creative North Star: "The Engineering Reference"**

<!-- markdownlint-enable MD036 -->

Context Radar looks like a well-kept internal reference, not a launch page. It is a dense, calm, decision-support
surface: a practitioner scanning verdicts and conflicts should feel they are reading a trustworthy spec sheet maintained
by people who show their working. The design carries its weight through typographic hierarchy, a single restrained
accent, and a rigorous status vocabulary, not through decoration.

The palette is a near-neutral warm-grey ground with one violet accent reserved for primary signal (the current
selection, the "Best" verdict, links). Colour does real work: five status dots and six verdict pills each map to a fixed
meaning, and that meaning is always paired with a text label so it survives colour blindness and greyscale. The system
is deliberately flat: surfaces sit on hairline borders, and a single soft shadow appears only where something lifts (a
modal, a card on hover).

This system explicitly rejects the marketing look. No gradient text, no glassmorphism, no big-number hero-metric
template, no identical icon-card grids, no eyebrow kickers, no emoji standing in for a real component.

**Key Characteristics:**

- Dense, scannable, low-noise. One loud element per row (the verdict pill); everything else recedes.
- One violet accent, used only for selection, primary action, and state; never decoration.
- Status carried by a consistent dot and pill vocabulary, always with a text label.
- Flat by default; a single shadow token for genuine elevation.
- Fully themed light and dark from one token set, with an explicit toggle.

## 2. Colors

A warm near-neutral ground with a single violet accent and a fixed semantic status set. Every value is a CSS custom
property in `src/styles/tokens.css`; the same token names are redefined under the dark media query and the
`[data-theme]` overrides, so the palette below is the light canonical.

### Primary

- **Signal Violet** (#534ab7): the one accent. Primary actions, the current selection, links, the "Best" verdict, sort
  direction, focus rings. Paired with **Violet Wash** (#eeedfe) as its tint and **Violet Line** (#7f77dd) as its border.

### Neutral

- **Ink** (#17161a): primary text and the wordmark.
- **Muted Ink** (#56545e): secondary text, descriptions, metadata.
- **Subtle Ink** (#67656f): de-emphasised text, table headers, the decision-rule column. Darkened from an earlier
  lighter grey to clear WCAG AA on every surface.
- **Paper / Surface / Deep Surface** (#ffffff / #f6f5f3 / #edece8): the three background layers, page to panel to inset.
- **Hairline** (#17161a1a) and **Strong Hairline** (#17161a33): borders and dividers, expressed as transparencies of ink
  so they hold across themes.

### Semantic status

- **Verdict + licence tints**: green (#27500a on #eaf3de), amber (#7a4a06 on #faeeda), red (#8a2020 on #fcebeb), gray
  (#4a4844 on #f0efe9). Foreground/background pairs are pre-tuned for contrast.
- **Activity dots**: active #3f9142, stable #c88a1a, slowing #d97706, early #c04141, dormant #9b99a2. Each dot is always
  followed by its text label.

### Named Rules

**The One Accent Rule.** Signal Violet is the only accent. Conflict and warning states use the semantic red/amber
tokens; nothing else on the surface is allowed a second decorative colour.

**The No Literal Colour Rule.** Every colour in the code is a `var(--token)`. A literal hex in a component or stylesheet
is a bug: add the value to the token set, do not inline it.

## 3. Typography

**Body / UI Font:** the system sans stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`). **Mono
Font:** `ui-monospace, SFMono-Regular, Menlo, monospace`, for inline code in the Methodology and Glossary content.

**Character:** one family, tuned by weight and size. Product UI does not need a display pairing; the system font
disappears into the task and renders crisply at the densities a data table needs.

### Hierarchy

- **Display** (700, 40px, line-height 1.05, tracking -0.025em): landing hero only.
- **Headline** (650, 18px, tracking -0.01em): section and card headings, modal titles.
- **Title** (600, 15px): page titlebands, panel titles.
- **Body** (400, 13px on the comparison table, 14px on landing and stack-builder, line-height 1.5 to 1.6): descriptions
  and prose. Prose caps at 65 to 75ch; dense table cells may run denser.
- **Label** (600, 11px, uppercase, tracking 0.05em): filter labels, column headers, kickers.

### Named Rules

**The Fixed-Scale Rule.** Sizes are fixed px, not fluid clamp, everywhere except the single landing hero. A fluid
heading that shrinks inside a panel looks worse, not better, in product UI.

## 4. Elevation

Flat by default. Depth is conveyed by the three background layers and hairline borders, not by shadow. A single shadow
token exists for genuine lift.

### Shadow Vocabulary

- **Lift** (`box-shadow: 0 6px 22px rgba(23, 22, 26, 0.1)`; dark theme `rgba(0, 0, 0, 0.5)`): the modal overlay and the
  multiselect filter panel. The only shadow in the system.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. The Lift shadow appears only on elements that float above the
page (modal, dropdown panel). Cards lift with a border-colour shift and a 2px translate on hover, not a shadow.

## 5. Components

### Buttons

- **Shape:** 8px radius (`{rounded.md}`).
- **Accent:** violet-wash background, violet text, violet-line border (the Recommended-stack, Export, and empty-state
  actions).
- **Ghost:** transparent, muted-ink text, hairline border.
- **Hover / Focus:** background steps to Deep Surface; focus shows the 2px violet focus-visible ring.

### Chips

- **Style:** pill radius, hairline border, muted-ink text on Paper.
- **State:** selected chips take the violet wash, violet text, and violet-line border (the stack-builder layer filters).

### Cards / Containers

- **Corner Style:** 12px (`{rounded.lg}`) for table wrap and tool cards, 14px (`{rounded.xl}`) for the modal and landing
  cards.
- **Background:** Paper on the Surface page ground.
- **Border:** hairline; hover shifts the border to violet-line with a 2px lift translate (landing cards).
- **Shadow Strategy:** none at rest; see Elevation.

### Inputs / Fields

- **Style:** hairline (strong) border, Paper background, 8px radius, search icon inset left.
- **Focus:** border steps to violet-line with a 3px violet-wash glow.
- **Placeholder:** Subtle Ink, so placeholder text clears AA rather than falling to the browser grey.

### Navigation

- **Style:** sticky top bar, brand wordmark, text nav links (muted ink, violet-wash pill on active), and a theme toggle
  at the far right.
- **Mobile:** links wrap and gain a 44px hit area; the theme toggle grows to 44px.

### Signature: the verdict pill and status dot

- **Verdict pill:** 20px pill, 11px bold text, one fixed colour pair per decision (Best violet, Add green, Add-if /
  Either-or amber, Watch / Reference gray, Drop red). The single loud element in a comparison row.
- **Status dot:** an 8px dot in one of the five activity colours, always immediately followed by its text label. The
  same dot component appears in the table and in the activity filter, never an emoji.

## 6. Do's and Don'ts

### Do

- **Do** route every colour through a `var(--token)`; add a token before you reach for a literal hex.
- **Do** pair every status colour (dot, pill, conflict severity) with a text label, so meaning survives greyscale and
  colour blindness.
- **Do** keep body and header text at or above 4.5:1 in both themes; Subtle Ink is the floor, not a lighter grey.
- **Do** animate with `transform` and `opacity`, keep transitions 120 to 250ms, and ship a `prefers-reduced-motion`
  fallback.
- **Do** give interactive controls a 44px hit area on small screens, and reflow the comparison table into per-tool cards
  below 720px.

### Don't

- **Don't** inline a literal hex, rgb, or one-off colour in a component or stylesheet.
- **Don't** use gradient text, glassmorphism, a big-number hero-metric template, or decorative gradients.
- **Don't** add a tracked-uppercase eyebrow above every section, an identical icon-card grid, or 01/02/03 numbered
  scaffolding.
- **Don't** convey status or meaning with an emoji where the status dot or verdict pill should carry it.
- **Don't** use a colored `border-left` greater than 1px as a side stripe on cards, cells, or callouts; carry severity
  on the coloured label instead.
- **Don't** animate layout properties (width, height, margin); use `transform` so the change stays off the layout path.
