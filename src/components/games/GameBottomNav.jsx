import { NavLink } from 'react-router-dom'
import styles from './GameBottomNav.module.css'

export default function GameBottomNav({ gameSlug }) {
  return (
    <nav className={styles.nav} aria-label="Game navigation">
      <NavLink to={`/games/${gameSlug}`} className={({ isActive }) => isActive ? `${styles.tab} ${styles.active}` : styles.tab}>
        <span className={styles.tabIcon}>⌂</span>
        <span className={styles.tabLabel}>Home</span>
      </NavLink>
      <NavLink to="/games" className={({ isActive }) => isActive ? `${styles.tab} ${styles.active}` : styles.tab}>
        <span className={styles.tabIcon}>🎮</span>
        <span className={styles.tabLabel}>All Games</span>
      </NavLink>
      <NavLink to="/redeem" className={({ isActive }) => isActive ? `${styles.tab} ${styles.active}` : styles.tab}>
        <span className={styles.tabIcon}>💎</span>
        <span className={styles.tabLabel}>Redeem</span>
      </NavLink>
    </nav>
  )
}
