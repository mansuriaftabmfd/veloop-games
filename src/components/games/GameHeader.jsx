import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGameEconomy } from '../../context/GameEconomyContext.jsx'
import { sound } from '../../utils/audio.js'
import styles from './GameHeader.module.css'

export default function GameHeader({ backTo = '/games' }) {
  const { state } = useGameEconomy()
  const [muted, setMuted] = useState(sound.isMuted)

  useEffect(() => {
    const unsub = sound.onMuteChange((m) => setMuted(m))
    return unsub
  }, [])

  const handleMute = () => {
    sound.toggleMute()
    sound.playClick()
  }

  return (
    <header className={styles.header}>
      <Link to={backTo} className={styles.back} aria-label="Go back">
        <span className={styles.backArrow}>←</span>
        <span>Back</span>
      </Link>

      <div className={styles.balances}>
        <div className={styles.pill}>
          <span aria-hidden="true">🪙</span>
          <strong>{state.tokens}</strong>
          <span className={styles.label}>Tokens</span>
        </div>
        <div className={`${styles.pill} ${styles.coinPill}`}>
          <span aria-hidden="true">💎</span>
          <strong>{state.gameCoins}</strong>
          <span className={styles.label}>Coins</span>
        </div>

        <button
          type="button"
          className={styles.muteBtn}
          onClick={handleMute}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </header>
  )
}
