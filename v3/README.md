# Kwoat — web front end, version 3 ("Convergence")

A third, independent design. Versions 1 (repo root) and 2 (`v2/`) are untouched; this folder is its own project with
its own build and upload package.

## Concept

The real Kwoat mark is five rays meeting at one point: many models, one answer. Version 3 builds the whole site on
that idea, in the brand's own colours and typeface:

- **Brand:** violet `#7c3aed` on near-black, the original logo geometry, Geist and Geist Mono.
- **Hero:** a WebGL shader draws the logo as five beams of violet light falling onto the prompt box. Light moves
  down each beam, dust drifts through them, and the convergence point follows the pointer. The beams are aimed at
  the prompt box wherever the layout puts it.
- **Restraint:** blur-in reveals, masked line reveals, hairline borders, spotlight edges that follow the cursor, and
  one accent colour. No custom cursor, no gimmicks.

## Landing page

| Section | What happens |
|---|---|
| Hero | Rays + headline + live prompt box (typewriter prompts, "Routing to …" chip) |
| Product | A detailed replica of the app window, tilted back in 3D, that settles flat as you scroll; the reply types itself and a live preview appears. Model marquee below |
| Routing | Three steps (Read → Route → Answer) with progress bars, synced to a diagram: light flows from the prompt into the Kwoat mark, then down to the chosen model |
| Features | Bento grid with live demos: compare, image generation, voice ring, agent mission, usage chart |
| One wallet | Pinned scroll story: five subscriptions fan out, collapse into one Kwoat wallet card, then a per-reply ledger prints |
| Inside the app | Auto-advancing tour of the client's **real product screenshots** (`public/shots/`) |
| Voices / Pricing / FAQ | Quotes, pricing with animated prices and a rotating highlight on Pro, smooth accordion |
| Finale + footer | The rays again over the closing call to action; status chip; oversized faded mark |

The app (`/app`, demo login: any email + 8-character password) shares the v1 screen logic with v3 styling and the
real logo.

## Run, build, host

```bash
cd v3
npm install
npm run dev        # http://localhost:5173
npm run build      # → v3/dist
```

For cPanel / DirectAdmin, upload the **contents** of `v3/dist/` (including the hidden `.htaccess`) into
`public_html/`.

## Backend

Same contract as v1: every call goes through `src/api/index.ts`; see the endpoint table in the root `README.md`.
