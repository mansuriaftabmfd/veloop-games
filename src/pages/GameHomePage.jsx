import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import games from '../data/gamesData.js'
import { useGameEconomy } from '../context/GameEconomyContext.jsx'
import { getBestScore } from '../utils/highScores.js'

import GameHeader from '../components/games/GameHeader.jsx'
import GameBottomNav from '../components/games/GameBottomNav.jsx'
import GameGuideModal from '../components/games/GameGuideModal.jsx'

import styles from './GameHomePage.module.css'

export default function GameHomePage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const game = useMemo(() => games.find((item) => item.slug === slug), [slug])

  const { state, spendTokens, markGuideSeen } = useGameEconomy()

  const [guideOpen, setGuideOpen] = useState(false)
  const [requiredGuide, setRequiredGuide] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('warn') // 'warn' | 'error'

  const bestScore = game ? getBestScore(game.slug) : 0

  if (!game) {
    return (
      <div className={styles.missing}>
        <span>🎮</span>
        <p>Game not found.</p>
        <Link to="/games" className={styles.missingLink}>← Back to Games</Link>
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

  // Star rating helper
  const getDifficultyStars = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return '⭐ Easy'
      case 'hard':
        return '⭐⭐⭐ Hard'
      case 'medium':
      default:
        return '⭐⭐ Medium'
    }
  }

  return (
    <main className={styles.page} style={{ '--accent': game.accent || '#FF6B35' }}>
      {/* Accent glow blob */}
      <div className={styles.accentBlob} aria-hidden="true" />

      <div className={styles.shell}>
        <GameHeader />

        {/* ── HERO BANNER ── */}
        <section className={styles.hero}>
          {/* Left: Cinematic Artwork Poster */}
          <div className={styles.artwork}>
            <img src={game.image} alt={`${game.name} artwork`} />
            <div className={styles.artworkGradient} aria-hidden="true" />

            {/* Game status badge on artwork */}
            {isPlayable ? (
              <div className={`${styles.artBadge} ${styles.liveBadge}`}>
                <span className={styles.liveDot} aria-hidden="true" />
                PLAYABLE NOW
              </div>
            ) : (
              <div className={`${styles.artBadge} ${styles.soonBadge}`}>
                🔒 Coming Soon
              </div>
            )}
          </div>

          {/* Right: Info Card with prominent Title & Meta */}
          <div className={styles.infoCard}>
            <div className={styles.infoBadges}>
              <span className={styles.category}>{game.category || 'Arcade'}</span>
              {game.difficulty && (
                <span className={`${styles.diffBadge} ${styles[`diff${game.difficulty}`]}`}>
                  {getDifficultyStars(game.difficulty)}
                </span>
              )}
            </div>

            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleGrad}>{game.name}</span>
            </h1>

            <p className={styles.desc}>
              {game.description || 'A high-intensity VELOOP arcade experience. Test your skills, beat personal records, and earn Game Coins!'}
            </p>

            {/* Stats Plaque */}
            <div className={styles.heroStatsPills}>
              {bestScore > 0 && (
                <div className={`${styles.statPill} ${styles.bestScorePill}`}>
                  <span className={styles.statPillIcon}>🏆</span>
                  <div>
                    <small>PERSONAL BEST</small>
                    <strong>{bestScore.toLocaleString()} PTS</strong>
                  </div>
                </div>
              )}

              <div className={styles.statPill}>
                <span className={styles.statPillIcon}>🪙</span>
                <div>
                  <small>ENTRY FEE</small>
                  <strong>{game.cost} Tokens</strong>
                </div>
              </div>

              <div className={`${styles.statPill} ${styles.rewardPill}`}>
                <span className={styles.statPillIcon}>💎</span>
                <div>
                  <small>EARN</small>
                  <strong>Game Coins</strong>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className={styles.ctaRow}>
              <button
                className={`${styles.playBtn} ${!isPlayable ? styles.playBtnSoon : ''}`}
                onClick={start}
                type="button"
                aria-label={isPlayable ? `Play ${game.name}` : `${game.name} is coming soon`}
              >
                <span className={styles.playBtnShimmer} aria-hidden="true" />
                <span className={styles.playBtnText}>
                  {isPlayable ? '▶ Play Now' : '🔒 Coming Soon'}
                </span>
              </button>

              {game.guide && isPlayable && (
                <button
                  className={styles.howBtn}
                  onClick={() => { setRequiredGuide(false); setGuideOpen(true) }}
                  type="button"
                >
                  📖 How to Play
                </button>
              )}
            </div>

            {/* Notification messages */}
            {message && (
              <div
                className={`${styles.notice} ${styles[messageType]}`}
                role="status"
              >
                <div>{message}</div>
                {state.tokens < game.cost && (
                  <Link to="/redeem" className={styles.claimBtn}>
                    💎 Go to Redemption Center
                  </Link>
                )}
              </div>
            )}

            {/* Token balance reminder */}
            <div className={styles.tokenBalance}>
              <span>Your Balances:</span>
              <strong className={styles.balanceHighlight}>🪙 {state.tokens} Tokens</strong>
              <span>·</span>
              <strong className={styles.balanceCoinHighlight}>💎 {state.gameCoins} Coins</strong>
            </div>
          </div>
        </section>

        {/* ── GAME INSTRUCTIONS PREVIEW ── */}
        {game.guide && (
          <section className={styles.guidePreview}>
            <div className={styles.guidePreviewHeader}>
              <h3 className={styles.guidePreviewTitle}>
                <span>📖</span> Quick Rules & Gameplay Guide
              </h3>
              <span className={styles.guidePreviewTag}>Everything you need to master {game.name}</span>
            </div>
            <div className={styles.guideSteps}>
              {game.guide.map((step, i) => (
                <div key={step} className={styles.guideStep}>
                  <span className={styles.guideStepNum}>{i + 1}</span>
                  <span className={styles.guideStepText}>{step}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── FEATURES ── */}
        <section className={styles.features}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>💎</span>
            <b>Centralized Rewards</b>
            <span>Game Coins flow directly into your VELOOP account balance.</span>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>⚡</span>
            <b>Instant Revive Flow</b>
            <span>Continue your streak if you make a mistake and claim bigger rewards.</span>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>📱</span>
            <b>Arcade Quality</b>
            <span>Responsive touch, keyboard, and mouse controls on any device.</span>
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