import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameEconomy } from '../../context/GameEconomyContext.jsx'
import { getBestScore } from '../../utils/highScores.js'
import PlayNowButton from './PlayNowButton.jsx'
import styles from './GameCard.module.css'

export default function GameCard({ game, ariaHidden }) {
  const navigate = useNavigate()
  const { state } = useGameEconomy()
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const disabled = state.tokens < game.cost
  const isPlayable = !!game.playable
  const best = getBestScore(game.slug)

  return (
    <article
      data-game-card
      className={styles.card}
      style={{ '--accent': game.accent }}
      aria-label={`${game.name} game card`}
      aria-hidden={ariaHidden}
    >
      {/* ── ARTWORK ── */}
      <div className={styles.artworkWrap}>
        {!loaded && !failed && (
          <div className={styles.skeleton} aria-hidden="true" />
        )}
        {failed ? (
          <div className={styles.fallback} aria-hidden="true">
            <span>🎮</span>
          </div>
        ) : (
          <img
            src={game.image}
            alt={`${game.name} game artwork`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={loaded ? styles.loaded : ''}
          />
        )}

        {/* Gradient overlay from bottom */}
        <div className={styles.artworkOverlay} aria-hidden="true" />

        {/* Top meta: category + badge */}
        <div className={styles.topMeta}>
          <span className={styles.category}>{game.category}</span>
          {game.badge && (
            <span className={styles.badge}>{game.badge}</span>
          )}
        </div>

        {/* Difficulty badge */}
        {game.difficulty && (
          <div className={`${styles.diffBadge} ${styles[`diff${game.difficulty}`]}`}>
            {game.difficulty}
          </div>
        )}

        {/* LIVE / COMING SOON badge */}
        <div className={`${styles.statusBadge} ${isPlayable ? styles.live : styles.soon}`}>
          {isPlayable ? (
            <><span className={styles.liveDot} aria-hidden="true" />LIVE</>
          ) : (
            <>🔒 Coming Soon</>
          )}
        </div>

        {/* Coming soon overlay for non-playable */}
        {!isPlayable && (
          <div className={styles.comingSoonOverlay} aria-hidden="true">
            <div className={styles.lockIcon}>🔒</div>
            <span>Coming Soon</span>
          </div>
        )}
      </div>

      {/* ── ACTION AREA ── */}
      <div className={styles.actionArea}>
        <div className={styles.gameInfo}>
          <div className={styles.gameInfoTop}>
            <h4>{game.name}</h4>
            {best > 0 && (
              <span className={styles.bestScore}>🏆 {best}</span>
            )}
          </div>
          {game.description && (
            <p className={styles.gameDesc}>{game.description}</p>
          )}
          <div className={styles.gameMeta}>
            <span className={styles.tokenCost}>🪙 {game.cost} Tokens</span>
          </div>
        </div>
        <PlayNowButton
          disabled={disabled}
          locked={!isPlayable}
          onClick={() => navigate(`/games/${game.slug}`)}
          ariaLabel={
            !isPlayable
              ? `${game.name}: Coming Soon`
              : disabled
              ? `${game.name}: not enough Tokens`
              : `Play ${game.name}`
          }
        />
      </div>
    </article>
  )
}
