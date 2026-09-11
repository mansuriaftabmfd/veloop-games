import styles from './CarouselDots.module.css'

export default function CarouselDots({ count, active, onSelect }) {
  return (
    <div className={styles.dots} role="tablist" aria-label="Game carousel positions">
      {Array.from({ length: count }, (_, i) => (
        <button
          type="button"
          key={i}
          className={i === active ? styles.active : ''}
          onClick={() => onSelect(i)}
          aria-label={`Go to game ${i + 1}`}
          aria-selected={i === active}
          role="tab"
        />
      ))}
    </div>
  )
}
