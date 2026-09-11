import { useState } from 'react'
import GamesCarousel from '../components/games/GamesCarousel.jsx'
import games from '../data/gamesData.js'
import { useGameEconomy } from '../context/GameEconomyContext.jsx'
import styles from './GamesPage.module.css'

export default function GamesPage() {
  const { state, resetDemo } = useGameEconomy()
  const [devReset, setDevReset] = useState(0)

  // Hidden dev reset: click brand logo 5 times
  const handleBrandClick = () => {
    const next = devReset + 1
    setDevReset(next)
    if (next >= 5) {
      resetDemo()
      setDevReset(0)
    }
  }

  return (
    <main className={styles.page}>
      {/* Mesh background blobs */}
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      <section className={styles.shell}>
        {/* ── TOP BAR ── */}
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.brand}
            onClick={handleBrandClick}
            title="VELOOP Games"
            aria-label="VELOOP Games home"
          >
            <span className={styles.brandIcon} aria-hidden="true">V</span>
            <span>VELOOP <strong>Rewards</strong></span>
          </button>

          <div className={styles.wallet}>
            <div className={styles.walletPill}>
              <span className={styles.walletIcon} aria-hidden="true">🪙</span>
              <span className={styles.walletVal}>{state.tokens}</span>
              <span className={styles.walletLabel}>Tokens</span>
            </div>
            <div className={`${styles.walletPill} ${styles.coinPill}`}>
              <span className={styles.walletIcon} aria-hidden="true">💎</span>
              <span className={styles.walletVal}>{state.gameCoins}</span>
              <span className={styles.walletLabel}>Game Coins</span>
            </div>
          </div>
        </header>

        {/* ── HEADING ── */}
        <div className={styles.heading}>
          <div>
            <div className={styles.badge}>
              <span className={styles.pulse} aria-hidden="true" />
              GAMES
            </div>
            <h1 className={styles.headline}>
              Play. <span className={styles.gradText}>Earn.</span> Redeem.
            </h1>
            <p className={styles.sub}>
              Enter any game with 20 Tokens, earn Game Coins and redeem for real VELOOP rewards.
            </p>
          </div>
        </div>

        {/* ── CAROUSEL ── */}
        <GamesCarousel games={games} />

        {/* ── STATS ── */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🎮</span>
            <strong>13</strong>
            <span>Game Banners</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>⚡</span>
            <strong>2</strong>
            <span>Playable Now</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🪙</span>
            <strong>20</strong>
            <span>Tokens / Entry</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>💎</span>
            <strong>{state.gameCoins}</strong>
            <span>Your Coins</span>
          </div>
        </div>
      </section>
    </main>
  )
}
