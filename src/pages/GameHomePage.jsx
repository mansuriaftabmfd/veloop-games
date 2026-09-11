import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import games from '../data/gamesData.js'
import { useGameEconomy } from '../context/GameEconomyContext.jsx'

import GameHeader from '../components/games/GameHeader.jsx'
import GameBottomNav from '../components/games/GameBottomNav.jsx'
import GameGuideModal from '../components/games/GameGuideModal.jsx'

import styles from './GameHomePage.module.css'

export default function GameHomePage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const game = useMemo(() => games.find((item) => item.slug === slug), [slug])

  const { state, spendTokens, addTokens, markGuideSeen } = useGameEconomy()

  const [guideOpen, setGuideOpen] = useState(false)
  const [requiredGuide, setRequiredGuide] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('warn') // 'warn' | 'error'

  if (!game) {
    return (
      <div className={styles.missing}>
        <span>🎮</span>
        <p>Game not found.</p>
      </div>
    )
  }

  const isPlayable = !!game.playable

  const start = () => {
    setMessage('')

    if (!isPlayable) {
      setMessage('This game is coming soon! Stay tuned for updates.')
      setMessageType('info')
      return
    }

    if (state.tokens < game.cost) {
      setMessage(`You need ${game.cost} Tokens to play. You have ${state.tokens} — earn more by playing other games!`)
      setMessageType('error')
      return
    }

    const paid = spendTokens(game.cost)
    if (!paid) {
      setMessage(`Not enough Tokens. You need ${game.cost} Tokens to play.`)
      setMessageType('error')
      return
    }

    if (!state.guideSeen[game.slug]) {
      setRequiredGuide(true)
      setGuideOpen(true)
      return
    }

    navigate(`/games/${game.slug}/play`)
  }

  const continueFromGuide = () => {
    markGuideSeen(game.slug)
    setGuideOpen(false)
    setRequiredGuide(false)
    navigate(`/games/${game.slug}/play`)
  }

  const closeGuide = () => {
    if (requiredGuide) return
    setGuideOpen(false)
    setRequiredGuide(false)
  }

  return (
    <main className={styles.page} style={{ '--accent': game.accent }}>
      {/* Accent glow blob */}
      <div className={styles.accentBlob} aria-hidden="true" />

      <div className={styles.shell}>
        <GameHeader />

        {/* ── HERO ── */}
        <section className={styles.hero}>
          {/* Left: Artwork */}
          <div className={styles.artwork}>
            <img src={game.image} alt={`${game.name} artwork`} />
            <div className={styles.artworkGradient} aria-hidden="true" />

            {/* Game status badge on artwork */}
            {isPlayable ? (
              <div className={`${styles.artBadge} ${styles.liveBadge}`}>
                <span className={styles.liveDot} aria-hidden="true" />
                LIVE
              </div>
            ) : (
              <div className={`${styles.artBadge} ${styles.soonBadge}`}>
                🔒 Coming Soon
              </div>
            )}
          </div>

          {/* Right: Info card */}
          <div className={styles.infoCard}>
            <span className={styles.category}>{game.category || 'Game'}</span>
            <h1>{game.name}</h1>
            <p className={styles.desc}>
              {game.description || 'A new VELOOP challenge is waiting for you.'}
            </p>

            {/* Entry fee */}
            <div className={styles.entryFee}>
              <span className={styles.entryIcon}>🪙</span>
              <div>
                <small>ENTRY FEE</small>
                <strong>20 Tokens</strong>
              </div>
            </div>

            {/* CTA buttons */}
            <div className={styles.ctaRow}>
              <button
                className={`${styles.playBtn} ${!isPlayable ? styles.playBtnSoon : ''}`}
                onClick={start}
                type="button"
              >
                {isPlayable ? '▶ Play Now' : '🔒 Coming Soon'}
              </button>

              {game.guide && isPlayable && (
                <button
                  className={styles.howBtn}
                  onClick={() => { setRequiredGuide(false); setGuideOpen(true) }}
                  type="button"
                >
                  How to Play
                </button>
              )}
            </div>

            {/* Message */}
            {message && (
              <div
                className={`${styles.notice} ${styles[messageType]}`}
                role="status"
              >
                <div>{message}</div>
                {state.tokens < game.cost && (
                  <Link to="/games/redeem" className={styles.claimBtn}>
                    💎 Go to Redemption Center
                  </Link>
                )}
              </div>
            )}

            {/* Token balance reminder */}
            <div className={styles.tokenBalance}>
              <span>Your balance:</span>
              <strong>🪙 {state.tokens} Tokens</strong>
              <span>·</span>
              <strong>💎 {state.gameCoins} Coins</strong>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className={styles.features}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>💎</span>
            <b>Game Coins</b>
            <span>Rewards flow into one centralized balance.</span>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>⚡</span>
            <b>Revive</b>
            <span>Both playable games support a full revive flow.</span>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>📱</span>
            <b>Responsive</b>
            <span>Built for touch, mouse, tablet and desktop.</span>
          </div>
        </section>

        <GameBottomNav gameSlug={game.slug} />
      </div>

      {guideOpen && game.guide && (
        <GameGuideModal
          game={game}
          required={requiredGuide}
          onContinue={requiredGuide ? continueFromGuide : () => setGuideOpen(false)}
          onClose={closeGuide}
        />
      )}
    </main>
  )
}