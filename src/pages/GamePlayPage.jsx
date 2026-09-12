import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import games from '../data/gamesData.js'
import { useGameEconomy } from '../context/GameEconomyContext.jsx'
import { submitScore } from '../utils/highScores.js'
import GameHeader from '../components/games/GameHeader.jsx'
import BladeMaster from '../components/gameplay/BladeMaster.jsx'
import Nutcraft from '../components/gameplay/Nutcraft.jsx'
import { sound } from '../utils/audio.js'
import styles from './GamePlayPage.module.css'

function rewardFor(slug, score) {
  if (slug === 'blade-master') {
    return Math.min(60, 15 + Math.floor(score / 50) * 5)
  }
  if (slug === 'nutcraft') {
    return Math.min(60, 20 + Math.floor(score / 100) * 5)
  }
  return 15
}

const COUNTDOWN_STEPS = ['3', '2', '1', 'GO!']

export default function GamePlayPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const game = useMemo(
    () => games.find((item) => item.slug === slug),
    [slug]
  )

  const { addGameCoins } = useGameEconomy()
  const [reward, setReward] = useState(null)
  const [isNewBest, setIsNewBest] = useState(false)

  // Countdown state
  const [countdownStep, setCountdownStep] = useState(0) // 0=3,1=2,2=1,3=GO,4=playing
  const [gameReady, setGameReady] = useState(false)
  const countdownRef = useRef(null)

  useEffect(() => {
    if (!game?.playable) return

    // Start countdown
    let step = 0
    const tick = () => {
      step++
      if (step < COUNTDOWN_STEPS.length) {
        setCountdownStep(step)
        if (step < 3) sound.playCountdownTick()
        else sound.playCountdownGo()
        countdownRef.current = setTimeout(tick, step === COUNTDOWN_STEPS.length - 1 ? 700 : 900)
      } else {
        setGameReady(true)
      }
    }

    sound.playCountdownTick()
    countdownRef.current = setTimeout(tick, 900)

    return () => clearTimeout(countdownRef.current)
  }, [game?.playable])

  if (!game?.playable) {
    return (
      <div className={styles.invalid}>
        This game is not enabled in the playable prototype.
      </div>
    )
  }

  const finish = (score) => {
    if (reward !== null) return

    const amount = rewardFor(slug, score)
    const { isNewBest: newBest } = submitScore(slug, score)

    if (newBest) {
      sound.playNewBest()
    } else {
      sound.playLevelWin()
    }

    addGameCoins(amount)
    setReward(amount)
    setIsNewBest(newBest)

    setTimeout(() => {
      navigate(`/games/${slug}`, {
        replace: true,
        state: { earned: amount },
      })
    }, 2200)
  }

  const showingCountdown = !gameReady

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <GameHeader backTo={`/games/${slug}`} />

        <div className={styles.gameWrap}>
          {/* Countdown overlay */}
          {showingCountdown && (
            <div className={styles.countdownOverlay} aria-live="assertive" aria-label="Game starting countdown">
              <div className={styles.countdownContent}>
                <div className={styles.countdownBadge}>GET READY</div>
                <div
                  key={countdownStep}
                  className={`${styles.countdownNum} ${countdownStep === COUNTDOWN_STEPS.length - 1 ? styles.countdownGo : ''}`}
                >
                  {COUNTDOWN_STEPS[countdownStep]}
                </div>
                <p className={styles.countdownHint}>
                  {slug === 'blade-master' ? '🗡️ Click or tap the target to throw knives' : '🔩 Click glowing pieces to remove them'}
                </p>
              </div>
            </div>
          )}

          {slug === 'blade-master' && <BladeMaster onFinish={finish} paused={showingCountdown} />}
          {slug === 'nutcraft' && <Nutcraft onFinish={finish} paused={showingCountdown} />}
        </div>
      </div>

      {/* Reward overlay */}
      {reward !== null && (
        <div className={styles.rewardOverlay} role="status" aria-live="polite">
          <div className={styles.rewardCard}>
            <span className={styles.rewardEmoji} aria-hidden="true">💎</span>
            <strong className={styles.rewardAmount}>+{reward} Game Coins</strong>
            {isNewBest && (
              <div className={styles.newBestBadge}>🏆 NEW BEST SCORE!</div>
            )}
            <span className={styles.rewardSub}>Added to your centralized balance!</span>
          </div>
        </div>
      )}
    </main>
  )
}