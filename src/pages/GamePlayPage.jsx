import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import games from '../data/gamesData.js'
import { useGameEconomy } from '../context/GameEconomyContext.jsx'
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

export default function GamePlayPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const game = useMemo(
    () => games.find((item) => item.slug === slug),
    [slug]
  )

  const { addGameCoins } = useGameEconomy()
  const [reward, setReward] = useState(null)

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
    sound.playLevelWin()
    addGameCoins(amount)
    setReward(amount)

    setTimeout(() => {
      navigate(`/games/${slug}`, {
        replace: true,
        state: { earned: amount },
      })
    }, 1500)
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <GameHeader backTo={`/games/${slug}`} />

        <div className={styles.gameWrap}>
          {slug === 'blade-master' && <BladeMaster onFinish={finish} />}
          {slug === 'nutcraft' && <Nutcraft onFinish={finish} />}
        </div>
      </div>

      {reward !== null && (
        <div className={styles.reward} role="status">
          <span className={styles.rewardEmoji} aria-hidden="true">💎</span>
          <strong>+{reward} Game Coins</strong>
          <span>Added to your centralized balance!</span>
        </div>
      )}
    </main>
  )
}