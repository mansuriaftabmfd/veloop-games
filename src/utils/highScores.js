// Centralized high-score persistence — separate from economy localStorage
const STORAGE_KEY = 'veloop-games-highscores-v1'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * Get the stored best score for a game.
 * @param {string} slug — Game slug
 * @returns {number} Best score, or 0 if none recorded
 */
export function getBestScore(slug) {
  return load()[slug] || 0
}

/**
 * Submit a score. Only updates if it's a new personal best.
 * @param {string} slug — Game slug
 * @param {number} score — Score achieved
 * @returns {{ isNewBest: boolean, bestScore: number }}
 */
export function submitScore(slug, score) {
  const data = load()
  const previous = data[slug] || 0
  const isNewBest = score > previous

  if (isNewBest) {
    data[slug] = score
    save(data)
  }

  return { isNewBest, bestScore: isNewBest ? score : previous }
}

/**
 * Get all stored high scores.
 * @returns {Record<string, number>}
 */
export function getAllScores() {
  return load()
}
