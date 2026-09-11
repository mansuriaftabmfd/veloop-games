import styles from './PlayNowButton.module.css'

export default function PlayNowButton({
  onClick,
  disabled = false,
  locked = false,
  loading = false,
  label = 'Play Now',
  ariaLabel,
}) {
  const isLocked = locked && !disabled

  return (
    <button
      type="button"
      className={`${styles.button} ${isLocked ? styles.locked : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel || label}
    >
      <span className={styles.shimmer} aria-hidden="true" />
      <span className={styles.content}>
        {loading
          ? 'Starting…'
          : isLocked
          ? '🔒 Soon'
          : disabled
          ? '🪙 Need Tokens'
          : label}
        {!loading && !disabled && !isLocked && (
          <span className={styles.arrow} aria-hidden="true">→</span>
        )}
      </span>
    </button>
  )
}
