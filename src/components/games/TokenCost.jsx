import styles from './TokenCost.module.css'

export default function TokenCost({ amount = 20, compact = false }) {
  return (
    <div
      className={`${styles.cost} ${compact ? styles.compact : ''}`}
      aria-label={`${amount} Tokens required`}
    >
      <span className={styles.tokenEmoji} aria-hidden="true">🪙</span>
      <span>{amount} Tokens</span>
    </div>
  )
}
