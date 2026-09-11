import { Link } from 'react-router-dom'
import { useGameEconomy } from '../../context/GameEconomyContext.jsx'
import styles from './GameHeader.module.css'

export default function GameHeader({ backTo = '/games' }) {
  const { state } = useGameEconomy()
  return (
    <header className={styles.header}>
      <Link to={backTo} className={styles.back}>
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
      </div>
    </header>
  )
}
