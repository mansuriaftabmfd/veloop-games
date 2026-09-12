import { useMemo } from 'react'
import { sound } from '../../utils/audio.js'
import styles from './CategoryFilter.module.css'

export default function CategoryFilter({ games, active, onChange }) {
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(games.map((g) => g.category).filter(Boolean))]
    return cats
  }, [games])

  return (
    <div className={styles.bar} role="tablist" aria-label="Filter games by category">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          role="tab"
          aria-selected={active === cat}
          className={`${styles.pill} ${active === cat ? styles.active : ''}`}
          onClick={() => {
            sound.playClick()
            onChange(cat)
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
