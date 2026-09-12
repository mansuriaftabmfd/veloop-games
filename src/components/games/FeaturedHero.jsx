import { useNavigate } from 'react-router-dom'
import { getBestScore } from '../../utils/highScores.js'
import styles from './FeaturedHero.module.css'

export default function FeaturedHero({ game }) {
  const navigate = useNavigate()
  const best = getBestScore(game.slug)
  const isPlayable = !!game.playable

  return (
    <section
      className={styles.hero}
      style={{ '--accent': game.accent || '#FF6B35' }}
      aria-label={`Featured game: ${game.name}`}
      onClick={() => navigate(`/games/${game.slug}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') navigate(`/games/${game.slug}`)
      }}
    >
      {/* Full-bleed banner artwork */}
      <div className={styles.artworkWrap}>
        <img
          src={game.image}
          alt={`${game.name} banner artwork`}
          className={styles.bannerImg}
          loading="eager"
        />

        {/* Cinematic ambient lighting & bottom gradient overlay */}
        <div className={styles.bottomVignette} aria-hidden="true" />
        <div className={styles.topVignette} aria-hidden="true" />
        <div className={styles.rimGlow} aria-hidden="true" />
      </div>

      {/* Top badges — subtle & floating */}
      <div className={styles.topBadges}>
        <span className={styles.kickerBadge}>
          <span className={styles.pulseDot} aria-hidden="true" />
          FEATURED
        </span>
        <span className={styles.categoryBadge}>{game.category}</span>
        {isPlayable && (
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} aria-hidden="true" />
            PLAYABLE
          </span>
        )}
      </div>

      {/* Bottom Content Overlay — Minimalist, Cinematic, High Legibility */}
      <div className={styles.bottomContent}>
        <div className={styles.titleArea}>
          <h2 className={styles.gameTitle}>{game.name}</h2>
          {game.description && (
            <p className={styles.gameDesc}>{game.description}</p>
          )}
          <div className={styles.metaRow}>
            <span className={styles.tokenPill}>🪙 {game.cost} Tokens</span>
            {best > 0 && (
              <span className={styles.bestPill}>🏆 Best: {best.toLocaleString()}</span>
            )}
            {game.difficulty && (
              <span className={styles.diffPill}>⚡ {game.difficulty}</span>
            )}
          </div>
        </div>

        <button
          type="button"
          className={`${styles.playBtn} ${!isPlayable ? styles.lockedBtn : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/games/${game.slug}`)
          }}
          aria-label={isPlayable ? `Play ${game.name} now` : `${game.name} coming soon`}
        >
          <span className={styles.btnShimmer} aria-hidden="true" />
          <span className={styles.btnText}>
            {isPlayable ? '▶ Play Now' : '🔒 Coming Soon'}
          </span>
        </button>
      </div>
    </section>
  )
}
