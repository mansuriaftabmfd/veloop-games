import { useState } from 'react'
import { Link } from 'react-router-dom'
import GameHeader from '../components/games/GameHeader.jsx'
import { useGameEconomy } from '../context/GameEconomyContext.jsx'
import styles from './RedeemPage.module.css'

const offers = [
  {
    key: 've',
    label: 'VEs',
    cost: 100,
    amount: 10,
    icon: '⚡',
    iconClass: 've',
    desc: 'VELOOP Experience Points for your profile',
  },
  {
    key: 'sve',
    label: 'SVEs',
    cost: 120,
    amount: 6,
    icon: '🌟',
    iconClass: 'sve',
    desc: 'Special VELOOP Experience rewards',
  },
  {
    key: 'gems',
    label: 'Gems',
    cost: 60,
    amount: 5,
    icon: '💎',
    iconClass: 'gems',
    desc: 'Gems used across the VELOOP ecosystem',
  },
  {
    key: 'tokens',
    label: 'Tokens',
    cost: 80,
    amount: 20,
    icon: '🪙',
    iconClass: 'tokens',
    desc: 'Play more games with extra Tokens',
  },
  {
    key: 'spins',
    label: 'Spin Tickets',
    cost: 50,
    amount: 2,
    icon: '🎰',
    iconClass: 'spins',
    desc: 'Spin the VELOOP reward wheel',
  },
]

export default function RedeemPage() {
  const { state, redeem } = useGameEconomy()
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null) // { msg, type: 'success' | 'error' }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const confirm = () => {
    const result = redeem(selected)
    if (result.ok) {
      showToast(`✅ ${selected.amount} ${selected.label} added to your wallet!`, 'success')
    } else {
      showToast(`❌ Not enough Game Coins. You have ${state.gameCoins}, need ${selected.cost}.`, 'error')
    }
    setSelected(null)
  }

  return (
    <main className={styles.page}>
      {/* Accent blobs */}
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      <div className={styles.shell}>
        <GameHeader />

        {/* ── HEADER ── */}
        <section className={styles.head}>
          <div className={styles.headBadge}>💎 REDEEM</div>
          <h1>Turn Game Coins into<br /><span className={styles.gradText}>VELOOP Rewards</span></h1>
          <p>Spend your earned Game Coins on exclusive rewards.</p>

          <div className={styles.balance}>
            <span className={styles.balanceIcon}>💎</span>
            <div>
              <strong>{state.gameCoins}</strong>
              <span>Game Coins available</span>
            </div>
          </div>
        </section>

        {/* ── OFFERS GRID ── */}
        <section className={styles.grid} aria-label="Redemption offers">
          {offers.map((offer) => {
            const canAfford = state.gameCoins >= offer.cost
            return (
              <article
                key={offer.key}
                className={`${styles.offer} ${!canAfford ? styles.offerDim : ''}`}
              >
                <div className={`${styles.offerIcon} ${styles[offer.iconClass]}`}>
                  {offer.icon}
                </div>
                <h2>{offer.label}</h2>
                <p>{offer.desc}</p>
                <div className={styles.rate}>
                  <span className={styles.rateFrom}>
                    <strong>{offer.cost}</strong> Coins
                  </span>
                  <span className={styles.rateArrow}>→</span>
                  <span className={styles.rateTo}>
                    <strong>{offer.amount}</strong> {offer.label}
                  </span>
                </div>
                <button
                  type="button"
                  className={`${styles.redeemBtn} ${!canAfford ? styles.redeemBtnDisabled : ''}`}
                  onClick={() => setSelected(offer)}
                  disabled={!canAfford}
                >
                  {canAfford ? `Redeem ${offer.amount} ${offer.label}` : 'Not enough Coins'}
                </button>
              </article>
            )
          })}
        </section>

        {/* ── WALLET ── */}
        <section className={styles.wallet}>
          <h2>Your Wallet</h2>
          <div className={styles.walletGrid}>
            <div><span>⚡</span><strong>{state.wallet.ve}</strong><label>VEs</label></div>
            <div><span>🌟</span><strong>{state.wallet.sve}</strong><label>SVEs</label></div>
            <div><span>💎</span><strong>{state.wallet.gems}</strong><label>Gems</label></div>
            <div><span>🎰</span><strong>{state.wallet.spins}</strong><label>Spins</label></div>
            <div><span>🪙</span><strong>{state.tokens}</strong><label>Tokens</label></div>
          </div>
        </section>

        {/* ── HISTORY ── */}
        <section className={styles.history}>
          <h2>Recent Redemptions</h2>
          {state.history.length ? (
            <div className={styles.historyList}>
              {state.history.map((item) => (
                <div key={item.id} className={styles.historyItem}>
                  <span>{item.cost} Coins → {item.amount} {item.label}</span>
                  <time>{new Date(item.at).toLocaleString()}</time>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyHistory}>No redemptions yet. Start earning Game Coins by playing!</p>
          )}
        </section>

        <Link to="/games" className={styles.gamesLink}>← Back to Games</Link>
      </div>

      {/* ── CONFIRM MODAL ── */}
      {selected && (
        <div
          className={styles.backdrop}
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div className={styles.modal} role="dialog" aria-modal="true">
            <div className={`${styles.modalIcon} ${styles[selected.iconClass]}`}>{selected.icon}</div>
            <h2>Confirm Redemption</h2>
            <p>
              Convert <strong>{selected.cost} Game Coins</strong> into{' '}
              <strong>{selected.amount} {selected.label}</strong>?
            </p>
            <div className={styles.modalBalance}>
              <span>After: <strong>{Math.max(0, state.gameCoins - selected.cost)} Coins</strong></span>
            </div>
            {state.gameCoins < selected.cost && (
              <div className={styles.modalWarning}>
                ⚠️ Not enough Game Coins. Keep playing to earn more!
              </div>
            )}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setSelected(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmBtn}
                onClick={confirm}
                disabled={state.gameCoins < selected.cost}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`} role="status">
          {toast.msg}
        </div>
      )}
    </main>
  )
}
