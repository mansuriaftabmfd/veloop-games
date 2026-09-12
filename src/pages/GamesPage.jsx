import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FeaturedHero from '../components/games/FeaturedHero.jsx'
import CategoryFilter from '../components/games/CategoryFilter.jsx'
import MobileGameCard from '../components/games/MobileGameCard.jsx'
import GamesCarousel from '../components/games/GamesCarousel.jsx'
import games from '../data/gamesData.js'
import { useGameEconomy } from '../context/GameEconomyContext.jsx'
import styles from './GamesPage.module.css'

export default function GamesPage() {
  const { state, resetDemo } = useGameEconomy()
  const navigate = useNavigate()
  const [devReset, setDevReset] = useState(0)
  const [category, setCategory] = useState('All')

  // Hidden dev reset: click brand logo 5 times
  const handleBrandClick = () => {
    const next = devReset + 1
    setDevReset(next)
    if (next >= 5) {
      resetDemo()
      setDevReset(0)
    }
  }

  // Dynamic stats
  const totalGames = games.length
  const playableCount = games.filter((g) => g.playable).length
  const featured = useMemo(() => games.find((g) => g.featured && g.playable) || games[0], [])

  // Filtered games (exclude the featured game from grid)
  const filtered = useMemo(() => {
    let list = games.filter((g) => g.id !== featured.id)
    if (category !== 'All') {
      list = list.filter((g) => g.category === category)
    }
    return list
  }, [category, featured.id])

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

        {/* ── FEATURED HERO ── */}
        <FeaturedHero game={featured} />

        {/* ── CATEGORY FILTER ── */}
        <div className={styles.filterSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionTitleIcon}>🎮</span>
            Explore Games
          </h2>
          <CategoryFilter games={games} active={category} onChange={setCategory} />
        </div>

        {/* ── DESKTOP: Carousel ── */}
        <div className={styles.desktopOnly}>
          {filtered.length > 0 ? (
            <GamesCarousel games={filtered} category={category} />
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🎯</span>
              <p>No games in this category yet.</p>
              <button
                type="button"
                className={styles.emptyBtn}
                onClick={() => setCategory('All')}
              >
                Show All Games
              </button>
            </div>
          )}
        </div>

        {/* ── MOBILE: 2-column grid ── */}
        <div className={styles.mobileOnly}>
          {filtered.length > 0 ? (
            <div className={styles.mobileGrid}>
              {filtered.map((game) => (
                <MobileGameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🎯</span>
              <p>No games in this category yet.</p>
              <button
                type="button"
                className={styles.emptyBtn}
                onClick={() => setCategory('All')}
              >
                Show All Games
              </button>
            </div>
          )}
        </div>

        {/* ── STATS ── */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🎮</span>
            <strong>{totalGames}</strong>
            <span>Total Games</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>⚡</span>
            <strong>{playableCount}</strong>
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

        {/* ── REDEEM CTA ── */}
        <div className={styles.redeemBanner}>
          <div>
            <h3>💎 Got Game Coins?</h3>
            <p>Trade them for VEs, SVEs, Gems, Spins and more VELOOP rewards.</p>
          </div>
          <button
            type="button"
            className={styles.redeemBtn}
            onClick={() => navigate('/redeem')}
          >
            Go to Redeem →
          </button>
        </div>
      </section>
    </main>
  )
}
