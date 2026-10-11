# Kwoat — web front end, version 4 ("Prism")

The fourth, independent design. Versions 1–3 are untouched; this folder is its own project with its own build and
upload package.

**Light mode by default, with a dark-mode switch.** Brand violet `#7c3aed`, the real Kwoat mark, Geist.

## Technology on show

| Effect | How it's built |
|---|---|
| **Hero** | Centred headline over a Stripe-style WebGL mesh gradient (pastel in light mode, deep violet in dark) and a fading engineering grid. Below it, a live replica of the Kwoat app in a browser window, tilted back in 3D, settles flat as you scroll. Inside, a prompt is typed and sent, Kwoat shows "Reading prompt → Choosing model" while it scans the models, then the answer streams in with the model and cost — on a loop. Glass cards (routing notice, compare, wallet) float around the window with pointer and scroll parallax. |
| **Theme switch** | View Transitions API: the new theme spreads out in a circle from the toggle. The hero gradient fades its palette to match. |
| **Pinned scroll scenes** | "How it works" (prompt cards fly in at different depths, get pulled into the mark, a beam picks the model, the answer rises) and "One wallet" (subscriptions collapse into one wallet card). |
| **Horizontal gallery** | Features scroll sideways inside a pinned section with inner parallax and live mini demos. |
| **Live playground** | A working compare demo on the landing page — type a prompt, four models stream side by side, the fastest is flagged. |
| **3D carousel** | The client's real app screenshots on a 3D ring that turns with scroll and can be dragged with inertia. |
| **Get the app** | Section above the footer, kept to a headline, one line and the store buttons. A floating, shining Kwoat app icon; feature icons circling the phones on an oval path; light sweeping across the screens; a tap ripple on the mic. An iPhone-style phone running the Kwoat chat (prompt → routing → streamed answer) with push notifications dropping in, an Android-style phone running Voice live (pulsing orb, waveform), floating feature chips, a slowly turning gradient and pulsing rings. Phones rise in on scroll, drift at different speeds, and tilt in 3D toward the pointer. App Store / Google Play buttons are styled for the site — set the real links in `APP_STORE_URL` / `PLAY_STORE_URL` at the top of `src/landing/AppDownload.tsx`. |
| **Plus** | Preloader with drawn logo, a slow provider strip (custom glyph cards that colour up on hover), letter-by-letter headline reveals, scroll-scrubbed text, 3D tilt cards with glare, parallax quotes, magnetic buttons, custom cursor with labels, animated pricing, smooth scrolling, film grain. |

All motion respects `prefers-reduced-motion`; WebGL pauses off-screen and falls back to a CSS gradient without WebGL.

The earlier hero with the 3D glass logo is kept in `src/landing/GlassScene.tsx` (not used on the page any more) and
in git history at commit `a0136fa`.

## The app (signed in, `/app`)

Rebuilt from the screens of the live kwoat.ai app, with the same structure and wording, plus motion:

| Screen | What's there |
|---|---|
| **Shell** | Sidebar with a turning-gradient Upgrade pill, New Chat (light sweep), a highlight that slides between Missions / Search / More, Projects, conversations grouped by day, and the account button with live wallet chip. Collapses to an icon rail with tooltips; a drawer on phones. Top bar with Auto mode and a daily-credits ring; the "Wallet empty" banner. |
| **Chat** (`/app/chat`) | Greeting revealed letter by letter, logo mark with a glowing ring, aurora background that follows the pointer. Message box with a rotating gradient border on focus, typed placeholder ideas, model picker (search, tiers, costs), + menu, dictation demo and voice-live button. Write / Code / Analyse / Compare / Image / Summarise tiles tilt in 3D and open prompt ideas. Replies show the routing scan, stream in, and carry copy / regenerate / rate / cost. Image prompts produce artwork that is saved to the Gallery. |
| **Search** (⌘K) | Command palette over all chats with highlighted matches and keyboard navigation. |
| **New project** | Chat or Mission workspace (Mission gated to Pro Max with an upgrade note). |
| **Missions** | Count-up stats, "What others are building" (click to preview), and a live agent terminal looping through a mission inside the Pro Max upgrade card. |
| **Wallet** | Overview / Credits / Transactions. Holographic 3D wallet card, credit-cost table, daily reset countdown. Top-up dialog with gliding selection, rolling total, processing and a confetti success. |
| **Usage** | KPIs, credits-over-time chart (draws in, hover tooltip), usage-by-type donut, feature usage, history by request / model / date. "Preview with sample data" fills it for demos. |
| **Gallery** | Filters with animated re-flow, lightbox, animated empty state. |
| **Subscription** (`/app/subscription`) | Current plan meter, monthly/annual switch, four plan cards, payment, how pricing works, FAQ. |
| **Settings** | Account, Access & Security (password, authenticator setup with QR and code entry, sessions), Integrations, Customize (theme, chat font size and style, default model, visible models — all applied to the chat), Notifications, Data & Control (JSON export, delete with typed confirmation), Help. |

Everything the app remembers (chats, projects, wallet, usage, images, preferences) is kept in the browser in
`src/app/workspace.tsx` until the backend exists; each action there maps to one endpoint.

## Run, build, host

```bash
cd v4
npm install
npm run dev        # http://localhost:5173
npm run build      # → v4/dist
```

To preview without a server, run `npm run build:single` and double-click `dist-single/index.html` (one self-contained
file; uses hash URLs like `#/app` so it works from disk).

For cPanel / DirectAdmin, upload the **contents** of `v4/dist/` (including the hidden `.htaccess`) into
`public_html/`. Demo login for the app: any email + an 8-character password.

## Backend

Same contract as v1: every call goes through `src/api/index.ts`; see the endpoint table in the root `README.md`.
