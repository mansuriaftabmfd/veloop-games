import styles from './GameGuideModal.module.css'

export default function GameGuideModal({ game, onContinue, onClose, required = false }) {
  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(e) => !required && e.target === e.currentTarget && onClose?.()}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.kicker}>HOW TO PLAY</div>
          <h2 id="guide-title">{game.name}</h2>
        </div>

        {/* Game image */}
        <div className={styles.artwork}>
          <img src={game.image} alt="" aria-hidden="true" />
          <div className={styles.artworkOverlay} aria-hidden="true" />
        </div>

        {/* Steps */}
        <ol className={styles.steps}>
          {game.guide?.map((item, i) => (
            <li key={item} className={styles.step}>
              <span className={styles.stepNum}>{i + 1}</span>
              <span className={styles.stepText}>{item}</span>
            </li>
          ))}
        </ol>

        {/* CTA */}
        <button type="button" className={styles.ctaBtn} onClick={onContinue}>
          Got it — Start Game ▶
        </button>
        {!required && (
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        )}
      </section>
    </div>
  )
}
