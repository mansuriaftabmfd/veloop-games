import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameEconomy } from '../../context/GameEconomyContext.jsx'
import styles from './MobileGameCard.module.css'

export default function MobileGameCard({ game }) {
  const navigate = useNavigate()
  const { state } = useGameEconomy()
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  const disabled = state.tokens < game.cost
  const isPlayable = !!game.playable

  const handleClick = () => {
    if (!isPlayable) return
    navigate(`/games/${game.slug}`)
  }

  return (
    <article
      className={styles.card}
      style={{ '--accent': game.accent }}
      aria-label={`${game.name} game card`}
      onClick={handleClick}
    >
      {/* ── ARTWORK ── */}
      <div className={styles.artwork}>
        {!loaded && !failed && (
          <div className={styles.skeleton} aria-hidden="true" />
        )}
        {failed ? (
          <div className={styles.fallback} aria-hidden="true">🎮</div>
        ) : (
          <img
            src={game.image}
            alt={`${game.name} artwork`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={loaded ? styles.loaded : ''}
          />
        )}

        {/* Bottom gradient for text readability */}
        <div className={styles.gradient} aria-hidden="true" />

        {/* Top-left: category pill */}
        <div className={styles.topRow}>
          <span className={styles.category}>{game.category}</span>
          {game.badge && (
            <span className={styles.badge}>{game.badge}</span>
          )}
        </div>

        {/* Status: LIVE dot or SOON */}
        <div className={`${styles.status} ${isPlayable ? styles.live : styles.soon}`}>
          {isPlayable ? (
            <><span className={styles.liveDot} aria-hidden="true" />LIVE</>
          ) : (
            <>🔒 Soon</>
          )}
        </div>

        {/* Coming-soon dim overlay */}
        {!isPlayable && (
          <div className={styles.lockedOverlay} aria-hidden="true" />
        )}
      </div>

      {/* ── INFO AREA ── */}
      <div className={styles.info}>
        <p className={styles.name}>{game.name}</p>
        <div className={styles.meta}>
          <span className={styles.cost}>🪙 {game.cost}</span>
        </div>
        <button
          type="button"
          className={`${styles.btn} ${!isPlayable ? styles.btnSoon : ''} ${disabled && isPlayable ? styles.btnDisabled : ''}`}
          disabled={disabled && isPlayable}
          onClick={(e) => { e.stopPropagation(); handleClick() }}
          aria-label={
            !isPlayable
              ? `${game.name}: Coming Soon`
              : disabled
              ? `${game.name}: not enough Tokens`
              : `Play ${game.name}`
          }
        >
          {!isPlayable ? '🔒 Soon' : disabled ? 'Need Tokens' : 'Play Now →'}
        </button>
      </div>
    </article>
  )
}
