# Kwoat — web front end, version 5

A second landing page for the client, in a more standard modern-SaaS layout. Versions 1–4 are untouched; this
folder is its own project. The signed-in app (`/app`), login and sign-up are carried over from v4.

**Light mode by default, with a dark-mode switch.** Brand violet `#7c3aed`, the real Kwoat mark, Geist.

## The landing page

| Section | What it does |
|---|---|
| **Nav** | Floating bar that turns to frosted glass on scroll, with a scroll-progress line. "Product" opens a mega menu (six features + a Missions card). Full-screen menu on phones that opens in a circle. |
| **Hero** | Headline revealed word by word over a grid with falling light beams, two slow light cones and a glow that follows the pointer. Below it, a working mini Kwoat in a browser window: visitors type a prompt (or tap a suggestion), the model chips scan, the best model is picked with the reason, and the answer streams in — with "Continue in Kwoat" carrying the prompt into the app. It plays itself until someone types. The window lies back in 3D and stands up as you scroll; floating cards move with the pointer and the scroll. |
| **Logo strip** | One slow row of provider cards that colour up on hover and pause under the pointer. |
| **Auto mode** | A switchboard: six prompt types on the left, Kwoat in the middle, six models on the right, joined by curves. The active route lights up with a flowing gradient and a spark travels along it; it cycles on its own, or click a prompt. |
| **Features** | Bento grid with a glow that follows the pointer across all cards. Each card has a live demo: four models answering side by side, image tiles that reshuffle, a voice orb and waveform, a mission terminal, sources popping in, documents that fan out on hover. |
| **How it works** | Three steps scroll past while the picture beside them stays pinned and changes: the prompt types itself, the models orbit and one is chosen, the wallet is charged. A rail fills as you go. |
| **Models** | Every model as a card; filter by tier or image/video and the grid re-flows (GSAP Flip). Counters roll up below. |
| **Testimonials** | Three columns of quotes drifting at different speeds and directions. **Placeholder quotes — replace with real ones before launch.** |
| **Pricing** | Monthly/annual switch with rolling prices, a featured plan with a turning gradient border, and a drag slider that estimates a month on pay-as-you-go and suggests the cheapest plan. |
| **App band** | Two phones (chat and voice) with scroll parallax. Store links are placeholders — set `APP_STORE_URL` / `PLAY_STORE_URL` in `src/site/AppBand.tsx`. |
| **FAQ, footer** | Accordion; closing card with a pointer-lit grid; newsletter field; a giant outlined KWOAT that lights up under the pointer. |

All motion respects `prefers-reduced-motion`. Landing code lives in `src/site/`, styles in `src/styles/site.css`.

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
cd v5
npm install
npm run dev        # http://localhost:5173
npm run build      # → v5/dist
```

To preview without a server, run `npm run build:single` and double-click `dist-single/index.html` (one self-contained
file; uses hash URLs like `#/app` so it works from disk).

For cPanel / DirectAdmin, upload the **contents** of `v5/dist/` (including the hidden `.htaccess`) into
`public_html/`. Demo login for the app: any email + an 8-character password.

## Backend

Same contract as v1: every call goes through `src/api/index.ts`; see the endpoint table in the root `README.md`.
