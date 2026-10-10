# Kwoat — web front end

The marketing site and app UI for Kwoat ("Every AI model. One platform."). Front end only: every backend call goes through
one module that currently runs on an in-browser mock, so the whole product can be clicked through today.

## Stack

- **Vite + React 19 + TypeScript**, React Router
- **GSAP 3** (ScrollTrigger, SplitText, DrawSVG, ScrambleText, Flip, CustomEase) for every animation
- **Lenis** smooth scrolling, driven from GSAP's ticker so ScrollTrigger stays in sync
- **Three.js** custom shaders for the hero (noise-displaced orb + particle field)
- Plain CSS with design tokens (`src/styles/base.css`), dark and light themes, Geist / Geist Mono / Instrument Serif

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/
```

Log in with any email and an 8+ character password (demo mode).

## What's in it

**Landing page** (`src/landing/`)

| Section | Effects |
|---|---|
| Preloader | SVG logo stroke-draw, 0→100 counter cycling model names, split-curtain reveal |
| Hero | WebGL orb that follows the pointer and swells on scroll, particle field, per-character headline reveal, typewriter prompt box with live routing pill, magnetic buttons |
| Model marquee | Two infinite rows; scroll velocity speeds them up and skews them |
| Auto routing | Pinned, scroll-scrubbed diagram: prompt scrambles in, wire draws to the chosen model, a pulse travels along it |
| Features | Pinned horizontal scroll with inner parallax and five live mini-demos (compare, images, voice waveform, agent mission, usage chart) |
| Manifesto | Words un-blur one by one as you scroll |
| Stats / testimonials | Count-up numbers; 3D tilt cards with pointer-tracking shine |
| Pricing | Monthly/yearly toggle with tweened prices, pointer-following spotlight borders |
| CTA / footer | Scroll-scaled CTA panel, rotating light, giant wordmark rising from the bottom |

Site-wide: custom cursor (grows on links, shows labels via `data-cursor-label`), film grain, page fade transitions.

**App** (`src/app/`, behind `/login`)

- **Chat** — auto-routing with model badge, streamed replies, stop button, manual model picker, live credit counter
- **Compare** — choose up to 4 models by tier, stream them side by side, fastest badge, pick a winner
- **Gallery** — generate (with diffusion placeholder), Flip-animated insert, masonry grid, lightbox
- **Missions** — agent feed with steps, workspace file list, progress bar, stop
- **Voice live** — canvas-drawn reactive orb, simulated two-way call, live transcript
- **Usage** — KPIs, daily bar + trend line with hover, spend by model

All motion respects `prefers-reduced-motion`; the WebGL scene pauses when off-screen and falls back to a gradient
without WebGL. The layout works down to 360px wide.

## Connecting the backend

Screens only import from `src/api/index.ts`. Replace each mock function there with a real call; the types in
`src/api/types.ts` are the contract. Suggested endpoints:

| Function | Endpoint |
|---|---|
| `login`, `signup`, `logout`, `me` | `POST /auth/login`, `POST /auth/signup`, `POST /auth/logout`, `GET /auth/me` |
| `streamChat` | `POST /chat` → SSE stream: one `route` event (`RouteDecision`), `token` events, one `done` event (`{cost, modelId}`) |
| `listConversations` | `GET /conversations` |
| `listImages`, `generateImage` | `GET /images`, `POST /images` |
| `runMission` | `POST /missions` then SSE `GET /missions/:id/events` (each event is a `MissionStep`) |
| `usage` | `GET /usage?days=30` |
| Voice live | WebSocket for mic audio + transcript (UI in `src/app/Voice.tsx`) |

Set `VITE_API_URL` (see `.env.example`) for the base URL. `route()` in the mock is only there to drive the landing-page
demo; real routing happens server-side.

Model names, credit costs and plans live in `src/api/data.ts` — ideally served by the API later.

## Layout

```
src/
  api/          types, mock backend, static data — the only place that talks to a server
  app/          signed-in screens + AppShell (sidebar, top bar, credits)
  components/   Cursor, Logo, Magnetic button, icons
  landing/      every landing-page section + the Three.js scene
  lib/          motion setup (GSAP/Lenis), hooks (magnetic, tilt, spotlight, typewriter), auth/theme store
  pages/        Landing, Auth, NotFound
  styles/       base tokens, landing, auth, app
```
