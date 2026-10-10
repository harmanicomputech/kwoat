# Kwoat — web front end, version 2 ("Signal")

A second, independent design of the Kwoat front end. Version 1 (repo root) is untouched; this folder is a separate
project with its own `package.json`, build and upload package.

## Art direction

- **Paper and ink, one signal colour.** Warm off-white `#ecebe4`, near-black ink, and signal orange `#ff4f1a` used
  sparingly. Dark mode inverts paper and ink.
- **Editorial type.** Fraunces (variable: optical size, SOFT and WONK axes for the italic flourishes) for display,
  Inter Tight for text, JetBrains Mono for labels, numbering and data.
- **Hardware metaphor.** The product is shown as a physical device — the **K-1 Prompt Router** — and the motifs carry
  through: split-flap boards, LED banks, a mixing console, patch cables, ticket stubs, an oscilloscope.
- **Printed texture.** A WebGL ordered-dither (8×8 Bayer) field renders flowing noise as ink dots; pixels near the
  cursor bulge like a lens and flip to signal orange.

## What's on the landing page

| § | Section | What it does |
|---|---|---|
| — | Loader | Split-flap board flips through model names, panel lifts away in six strips |
| — | Hero | Dither field + headline revealed letter by letter + the K-1 device: drag / scroll / arrow-key the dial to change mode, the LCD types a prompt, the LED bank sweeps and lands on the routed model, press **Send** |
| 01 | The ensemble | Every model set as an index; rows invert on hover and a spec card trails the cursor |
| 02 | Live routing | Departures board — new prompts arrive and each row flips to its model, time and cost; live counter |
| 03 | Capabilities | Five cards stacked with sticky scroll: mixing console (compare), halftone prints (images), oscilloscope (voice), terminal (missions), receipt (usage) |
| — | Statement | Two giant lines of type driven by scroll in opposite directions, skewed by scroll speed, with a turning dial |
| 04 | Pricing | Ticket stubs with perforations and barcodes, a physical toggle, prices on split-flap digits |
| 05 | Voices | Quotes revealed word by word |
| — | Footer | World clocks, dither band with the giant wordmark |

Site-wide: crosshair cursor with live coordinates (turns into a label disc over interactive things), magnetic buttons
with rolling labels, smooth scrolling, light/dark theme.

**App** (behind `/login`, demo: any email + 8-character password): Chat with routed-model stubs, Compare as a mixing
desk with patch jacks and VU meters, Gallery as a contact sheet, Missions as a brief → terminal, Voice as an
oscilloscope call, Usage as a ledger with bar chart.

All motion respects `prefers-reduced-motion`. The dither and canvases pause off-screen. No 3D library — the hero
shader is ~150 lines of raw WebGL, so v2 is lighter than v1.

## Run, build, host

```bash
cd v2
npm install
npm run dev        # http://localhost:5173
npm run build      # → v2/dist
```

Hosting on cPanel / DirectAdmin is the same as v1: upload the **contents** of `v2/dist/` (including the hidden
`.htaccess`) into `public_html/`.

## Backend

Identical contract to v1: every call goes through `src/api/index.ts` (currently the in-browser mock in
`src/api/mock.ts`). See the endpoint table in the root `README.md`.
