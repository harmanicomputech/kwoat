# Kwoat — web front end, version 4 ("Prism")

The fourth, independent design. Versions 1–3 are untouched; this folder is its own project with its own build and
upload package.

**Light mode by default, with a dark-mode switch.** Brand violet `#7c3aed`, the real Kwoat mark, Geist.

## Technology on show

| Effect | How it's built |
|---|---|
| **3D glass logo** | The five-ray Kwoat mark extruded in Three.js with a physical glass material (transmission, iridescence, dispersion, clearcoat) lit by a studio environment map. The rays fly in and lock together on load, follow the mouse, float when idle, and pull apart along their own axes as you scroll. |
| **Living gradient** | A full-screen GLSL mesh gradient behind the glass — pastel in light mode, deep violet in dark — that the glass actually refracts. |
| **3D orbiting labels** | Model names circle the logo in 3D. They're real HTML, projected every frame through the WebGL camera so depth, scale and blur match the scene. |
| **Theme switch** | View Transitions API: the new theme spreads out in a circle from the toggle. The 3D scene fades its palette to match. |
| **Pinned scroll scenes** | "How it works" (prompt cards fly in at different depths, get pulled into the mark, a beam picks the model, the answer rises) and "One wallet" (subscriptions collapse into one wallet card). |
| **Horizontal gallery** | Features scroll sideways inside a pinned section with inner parallax and live mini demos. |
| **Live playground** | A working compare demo on the landing page — type a prompt, four models stream side by side, the fastest is flagged. |
| **3D carousel** | The client's real app screenshots on a 3D ring that turns with scroll and can be dragged with inertia. |
| **Plus** | Preloader with drawn logo, velocity-reactive model marquee, letter-by-letter headline reveals, scroll-scrubbed text, 3D tilt cards with glare, parallax quotes, magnetic buttons, custom cursor with labels, animated pricing, smooth scrolling, film grain. |

All motion respects `prefers-reduced-motion`; WebGL pauses off-screen and falls back to a CSS gradient without WebGL.

## Run, build, host

```bash
cd v4
npm install
npm run dev        # http://localhost:5173
npm run build      # → v4/dist
```

For cPanel / DirectAdmin, upload the **contents** of `v4/dist/` (including the hidden `.htaccess`) into
`public_html/`. Demo login for the app: any email + an 8-character password.

## Backend

Same contract as v1: every call goes through `src/api/index.ts`; see the endpoint table in the root `README.md`.
