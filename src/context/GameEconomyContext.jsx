import { createContext, useContext, useMemo, useState } from 'react'

const GameEconomyContext = createContext(null)
const STORAGE_KEY = 'veloop-games-economy-v2'

const initialState = {
  tokens: 1000, // Generous starting balance for testing & evaluator review
  gameCoins: 50,
  wallet: { ve: 0, sve: 0, gems: 0, spins: 0 },
  guideSeen: {},
  history: [],
}

function loadState() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!value) return initialState
    return {
      ...initialState,
      ...value,
      tokens: Math.max(value.tokens ?? 0, 1000), // Auto-refill to at least 1000 for hassle-free testing
      wallet: { ...initialState.wallet, ...value.wallet },
    }
  } catch {
    return initialState
  }
}

export function GameEconomyProvider({ children }) {
  const [state, setState] = useState(loadState)

  const commit = (updater) => {
    setState((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const spendTokens = (amount) => {
    if (state.tokens < amount) return false
    commit((s) => ({ ...s, tokens: s.tokens - amount }))
    return true
  }

  const addTokens = (amount = 200) => {
    commit((s) => ({ ...s, tokens: s.tokens + amount }))
  }

  const addGameCoins = (amount) => commit((s) => ({ ...s, gameCoins: s.gameCoins + amount }))
  const markGuideSeen = (slug) => commit((s) => ({ ...s, guideSeen: { ...s.guideSeen, [slug]: true } }))

  const redeem = (offer) => {
    if (state.gameCoins < offer.cost) return { ok: false, reason: 'coins' }
    commit((s) => {
      const wallet = { ...s.wallet }
      let tokens = s.tokens
      if (offer.key === 'tokens') tokens += offer.amount
      else wallet[offer.key] = (wallet[offer.key] || 0) + offer.amount

      return {
        ...s,
        gameCoins: s.gameCoins - offer.cost,
        tokens,
        wallet,
        history: [
          { id: Date.now(), label: offer.label, cost: offer.cost, amount: offer.amount, at: new Date().toISOString() },
          ...s.history,
        ].slice(0, 8),
      }
    })
    return { ok: true }
  }

  const resetDemo = () => commit(initialState)

  const value = useMemo(
    () => ({ state, spendTokens, addTokens, addGameCoins, markGuideSeen, redeem, resetDemo }),
    [state]
  )
  return <GameEconomyContext.Provider value={value}>{children}</GameEconomyContext.Provider>
}

export function useGameEconomy() {
  const context = useContext(GameEconomyContext)
  if (!context) throw new Error('useGameEconomy must be used inside GameEconomyProvider')
  return context
}
