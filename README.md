# 🎮 VELOOP Rewards — Games Banner & Mini-Game Ecosystem

> A production-grade, highly responsive web application built with **React 19**, **Vite**, and **Vanilla CSS Modules**, developed according to the official **VELOOP Rewards** task specification.

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-purple.svg)](https://vitejs.dev/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Configured-black.svg)](https://vercel.com/)
[![Responsive](https://img.shields.io/badge/Responsive-320px%20--%201920px%2B-green.svg)]()
[![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-orange.svg)]()

---

## 🌟 Live Demo
- **Production URL**: [https://veloop-games-flame.vercel.app/games](https://veloop-games-flame.vercel.app/games)

---

## 📋 Table of Contents
1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Playable Mini-Games](#-playable-mini-games)
4. [Token & Coin Economy](#-token--coin-economy)
5. [Tech Stack](#-tech-stack)
6. [Project Structure](#-project-structure)
7. [Getting Started](#-getting-started)
8. [Vercel Deployment](#-vercel-deployment)
9. [Mobile Responsiveness Audit](#-mobile-responsiveness-audit)

---

## 📖 Overview

This application serves as the interactive gaming hub for the **VELOOP Rewards** platform. Users browse an automated 13-game banner carousel, launch dedicated game pages, spend platform **Tokens** to play, earn centralized **Game Coins**, and redeem those coins for exclusive platform perks (VEs, SVEs, Gems, Tokens, and Spin Tickets).

---

## ✨ Key Features

- **13 AVIF Game Banners**: Structured data catalog with locked `16:10` aspect ratio and individual action areas.
- **Infinite Shimmer CTA**: Eye-catching dynamic shimmer animation on all "Play Now" triggers.
- **Auto-Scrolling Carousel**: Seamless continuous marquee scroll on desktop, touch-swipe slide advance on mobile.
- **Interactive Dot Indicators**: Direct slide-to-card navigation without cluttered arrow buttons.
- **Strict 0px Horizontal Overflow**: Conforms to Section 34 of the task specification (`scrollWidth === innerWidth` from 320px to 4K).
- **Web Audio API Engine**: Zero-asset procedural sound synthesizer for hits, whooshes, unscrews, clashing, and victories.
- **Centralized Economy**: Unified token balance, coin rewards, and 5-offer redemption center.
- **Fail-Safe Persistence**: Client-side `localStorage` state with automated schema defaults and private-browsing fallbacks.

---

## 🎯 Playable Mini-Games

### 1. 🗡️ Blade Master (`/games/blade-master/play`)
A high-intensity reaction and precision knife-throwing game.
- **SVG Target Geometry**: Concentric vector circles (Wood Rim, Wood Face, Crimson Ring, Gold Ring, Ruby Center) with zero oval distortion.
- **Polar Coordinate Mapping**: Click coordinates translate directly into rotating board coordinates, embedding blades at the exact point clicked.
- **Multi-Tier Scoring**:
  - 🎯 **Bullseye (Center)**: `+40 Points` (Gold popup)
  - ⭐ **Inner Ring**: `+25 Points`
  - 🔥 **Middle Ring**: `+15 Points`
  - ⚔️ **Outer Ring**: `+10 Points`
- **Combo Multipliers**: Consecutive clean hits increase combos (`2x`, `3x`, `4x...`) with ascending point bonuses.
- **Proximity Collision**: Clashing within `22px` of an existing blade costs 1 life.
- **Revive System**: Second-chance lifeline restores `+15s` and `2 lives`.
- **Game Coin Rewards**: Earn up to `50 Game Coins` based on final score.

### 2. 🔩 Nutcraft (`/games/nutcraft/play`)
A tactile mechanical puzzle game testing spatial logic and blocker resolution.
- **Dependency Graph Engine**: Pieces are locked under higher-layer bolts until blockers are removed.
- **Visual Feedback**: Real-time wiggle animation, sound synthesis, and red-pulse highlights on blocked attempts.
- **3 Progressive Levels**: Advancing puzzle complexity from 6 to 8 interlocking nuts.
- **Mistake Counter & Countdown Timer**: 3 strikes or timeout triggers Game Over.
- **Revive Flow**: Second-chance lifeline grants `+25s` and resets mistakes.
- **Game Coin Rewards**: Earn up to `60 Game Coins` upon solving all boards.

---

## 🪙 Token & Coin Economy

The closed-loop platform economy connects gameplay to tangible VELOOP rewards:

```
[ New Visitor ] ──────► 1,000 Starting Tokens (50 Full Matches)
                               │
                               ▼ (Entry Fee: 20 Tokens)
                  [ Play Blade Master / Nutcraft ]
                               │
                               ▼ (Performance Based)
                   Earn Centralized Game Coins (💎)
                               │
                               ▼
                   [ Redemption Center (/redeem) ]
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
    80 Coins              100 Coins             120 Coins
  (+20 Tokens)            (10 VEs)              (6 SVEs)
         │                     │                     │
         ▼                     ▼                     ▼
    60 Coins              50 Coins             Transaction
    (5 Gems)          (2 Spin Tickets)           History
```

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 (`react`, `react-dom`) |
| **Routing** | React Router DOM v7 (`BrowserRouter`, `Routes`, `Route`, `Navigate`) |
| **Build Tool** | Vite 7 (`@vitejs/plugin-react`) |
| **Styling** | Pure CSS Modules + Vanilla CSS Custom Properties |
| **Audio** | HTML5 Web Audio API (Procedural Oscillator Synthesis) |
| **Graphics** | Vector SVGs (`viewBox="0 0 320 320"`) + AVIF Banners |
| **Storage** | Client-Side `localStorage` with fail-safe initialization |
| **Deployment** | Vercel (Edge SPA Routing via `vercel.json`) |

---

## 📁 Project Structure

```text
veloop-games/
├── public/
│   ├── assets/
│   │   ├── games/                  # 13 AVIF Game Banners (game-01 to game-13)
│   │   └── icons/                  # Token & Coin AVIF Icons
│   └── _redirects                  # Netlify SPA redirect fallback
│
├── src/
│   ├── components/
│   │   ├── gameplay/               # Modular Mini-Game Engines
│   │   │   ├── BladeMaster.jsx     # Rotating Target Knife Reaction Game
│   │   │   └── Nutcraft.jsx        # Mechanical Nut-and-Bolt Puzzle Game
│   │   │
│   │   ├── games/                  # Reusable UI & Carousel Components
│   │   │   ├── CarouselDots.jsx    # Pagination dot indicators
│   │   │   ├── GameBottomNav.jsx   # Mobile bottom navigation bar
│   │   │   ├── GameCard.jsx        # 16:10 Aspect ratio game card
│   │   │   ├── GameGuideModal.jsx  # First-time how-to-play modal
│   │   │   ├── GameHeader.jsx      # Clean header with balance pills
│   │   │   ├── GamesCarousel.jsx   # Responsive marquee & swipe carousel
│   │   │   ├── PlayNowButton.jsx   # Shimmer CTA button
│   │   │   └── TokenCost.jsx       # 20 Token cost badge
│   │   │
│   │   └── index.js                # Centralized Barrel Export
│   │
│   ├── context/
│   │   └── GameEconomyContext.jsx  # Centralized Tokens, Coins & Wallet State
│   │
│   ├── data/
│   │   └── gamesData.js            # 13 Games Catalog (playable vs locked)
│   │
│   ├── pages/                      # Route Page Components
│   │   ├── GameHomePage.jsx        # Game Detail & Overview Page
│   │   ├── GamePlayPage.jsx        # Game Orchestrator & Reward Controller
│   │   ├── GamesPage.jsx           # Main Banner Carousel Home
│   │   └── RedeemPage.jsx          # Central Redemption Center (5 Offers)
│   │
│   ├── styles/
│   │   └── global.css              # Theme tokens, Space Grotesk font & resets
│   │
│   ├── utils/
│   │   └── audio.js                # Web Audio API Sound Synthesizer
│   │
│   ├── App.jsx                     # SPA Route Definitions & Redirects
│   └── main.jsx                    # React 18 DOM Root Bootstrap
│
├── .gitignore                      # Git exclusion rules (*.pdf, dist, node_modules)
├── vercel.json                     # Vercel SPA Rewrites (Prevents 404 on refresh)
├── vite.config.js                  # Vite Build Configuration
├── package.json                    # Dependencies & NPM scripts
└── README.md                       # Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation & Local Run

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd veloop-games
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open the local server URL (typically `http://localhost:5173`) in your browser.

4. **Production build:**
   ```bash
   npm run build
   npm run preview
   ```

---

## ☁️ Vercel Deployment

This project is pre-configured for one-click deployment on **Vercel**:

1. Push your repository to **GitHub**.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Verify the build configuration:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.

> **Note on SPA Routing**: `vercel.json` rewrites all incoming requests to `/index.html`, ensuring sub-routes like `/games/blade-master/play` and `/redeem` reload without 404 errors.

---

## 📱 Mobile Responsiveness Audit

Tested and verified across all standard viewports:

| Device / Viewport | Width | Layout | Status |
|---|---|---|---|
| Small Mobile | 320px – 375px | 1 Card/Slide, 2-Col Stats Grid | ✅ 0px Page Overflow |
| Standard Mobile | 390px – 414px | 1 Card/Slide, Full Touch Target | ✅ 0px Page Overflow |
| Tablet | 768px – 1024px | Multi-Card Marquee Carousel | ✅ 0px Page Overflow |
| Desktop & Widescreen | 1280px – 1920px+ | Centered Constrained Shell | ✅ Perfect Alignment |

---

Developed with ❤️ for the **VELOOP Rewards** Ecosystem.
