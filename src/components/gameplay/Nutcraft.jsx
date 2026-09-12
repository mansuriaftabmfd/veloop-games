// VELOOP Rewards — Nutcraft (Cyber-Industrial Workbench Edition: 3D Machined Bolts, Guidance HUD, Sparks)
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBestScore } from '../../utils/highScores.js'
import { sound } from '../../utils/audio.js'
import styles from '../../pages/GamePlayPage.module.css'

const NUT_TIME = 60

const LEVELS = [
  [
    { id: 1, x: 22, y: 25, rotation: -18, color: 'crimson', blockers: [] },
    { id: 2, x: 54, y: 24, rotation: 15, color: 'cyan', blockers: [] },
    { id: 3, x: 37, y: 45, rotation: -8, color: 'emerald', blockers: [1] },
    { id: 4, x: 66, y: 50, rotation: 18, color: 'amber', blockers: [2] },
    { id: 5, x: 22, y: 65, rotation: 10, color: 'violet', blockers: [1, 3] },
    { id: 6, x: 50, y: 70, rotation: -15, color: 'cyan', blockers: [3, 4] },
  ],
  [
    { id: 1, x: 20, y: 22, rotation: 12, color: 'emerald', blockers: [] },
    { id: 2, x: 58, y: 20, rotation: -15, color: 'amber', blockers: [] },
    { id: 3, x: 40, y: 38, rotation: 5, color: 'crimson', blockers: [1] },
    { id: 4, x: 68, y: 45, rotation: -10, color: 'cyan', blockers: [2] },
    { id: 5, x: 27, y: 58, rotation: -18, color: 'violet', blockers: [1, 3] },
    { id: 6, x: 52, y: 63, rotation: 12, color: 'emerald', blockers: [3, 4] },
    { id: 7, x: 75, y: 68, rotation: -12, color: 'crimson', blockers: [4, 6] },
  ],
  [
    { id: 1, x: 20, y: 22, rotation: -15, color: 'cyan', blockers: [] },
    { id: 2, x: 55, y: 20, rotation: 15, color: 'crimson', blockers: [] },
    { id: 3, x: 75, y: 30, rotation: -8, color: 'emerald', blockers: [2] },
    { id: 4, x: 37, y: 42, rotation: 12, color: 'amber', blockers: [1] },
    { id: 5, x: 62, y: 45, rotation: -18, color: 'violet', blockers: [2, 3] },
    { id: 6, x: 20, y: 65, rotation: 15, color: 'emerald', blockers: [1, 4] },
    { id: 7, x: 48, y: 68, rotation: -10, color: 'crimson', blockers: [4, 5] },
    { id: 8, x: 75, y: 70, rotation: 14, color: 'cyan', blockers: [3, 5, 7] },
  ],
]

function createInitialState() {
  return {
    level: 0,
    pieces: LEVELS[0],
    score: 0,
    moves: 0,
    time: NUT_TIME,
    mistakes: 0,
    removingId: null,
    wigglingId: null,
    activeBlockers: [],
    gameOver: false,
    completed: false,
    revived: false,
    paused: false,
    levelCleared: false,
    message: 'Remove glowing green-ring pieces first!',
  }
}

export default function Nutcraft({ onFinish, paused: externalPaused = false }) {
  const navigate = useNavigate()
  const [state, setState] = useState(createInitialState)
  const bestScore = getBestScore('nutcraft')

  const stateRef = useRef(state)
  stateRef.current = state

  const isPausedRef = useRef(false)
  isPausedRef.current = externalPaused || state.paused || state.gameOver || state.completed

  // ── TIMER ──
  useEffect(() => {
    if (isPausedRef.current) return

    const timer = setInterval(() => {
      if (isPausedRef.current) return
      setState((s) => {
        if (s.paused || s.gameOver || s.completed || externalPaused) return s
        if (s.time <= 1) {
          sound.playBlocked()
          return { ...s, time: 0, gameOver: true }
        }
        return { ...s, time: s.time - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [state.paused, externalPaused, state.gameOver, state.completed])

  // ── KEYBOARD SHORTCUT: ESCAPE TO PAUSE ──
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setState((s) => {
          if (s.gameOver || s.completed) return s
          return { ...s, paused: !s.paused }
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const isFree = useCallback((piece, pieces) => {
    return piece.blockers.every((blockerId) => !pieces.some((item) => item.id === blockerId))
  }, [])

  const removePiece = useCallback((piece) => {
    setState((s) => {
      if (s.gameOver || s.completed || s.removingId || s.paused || externalPaused || s.levelCleared) return s

      const newMoves = s.moves + 1

      if (!isFree(piece, s.pieces)) {
        const blockersRemaining = piece.blockers.filter((bId) => s.pieces.some((p) => p.id === bId))
        sound.playBlocked()
        const nextMistakes = s.mistakes + 1
        return {
          ...s,
          moves: newMoves,
          mistakes: nextMistakes,
          wigglingId: piece.id,
          activeBlockers: blockersRemaining,
          gameOver: nextMistakes >= 3,
          message: '🔒 Blocked! Clear glowing red blocker bolt first.',
        }
      }

      sound.playUnscrew()
      return {
        ...s,
        moves: newMoves,
        removingId: piece.id,
        score: s.score + 50,
        message: '🔩 Unscrewed bolt! +50 Points',
      }
    })

    // Clear wiggle after 650ms
    setTimeout(() => {
      setState((s) => {
        if (s.wigglingId !== piece.id) return s
        return { ...s, wigglingId: null, activeBlockers: [] }
      })
    }, 650)

    // Complete removal after spin animation
    setTimeout(() => {
      setState((s) => {
        if (s.removingId !== piece.id) return s
        const remaining = s.pieces.filter((item) => item.id !== piece.id)

        if (remaining.length === 0) {
          sound.playLevelWin()
          if (s.level < LEVELS.length - 1) {
            const nextLevel = s.level + 1
            return {
              ...s,
              removingId: null,
              level: nextLevel,
              pieces: LEVELS[nextLevel],
              message: `🎉 Assembly cleared! Level ${nextLevel + 1} starting...`,
            }
          } else {
            const bonus = s.time * 2
            return {
              ...s,
              removingId: null,
              completed: true,
              score: s.score + bonus,
            }
          }
        }
        return { ...s, removingId: null, pieces: remaining }
      })
    }, 280)
  }, [isFree, externalPaused])

  const revive = () => {
    setState((s) => ({
      ...s,
      revived: true,
      time: 25,
      mistakes: 0,
      gameOver: false,
      message: '🔩 Revived! Keep unscrewing!',
    }))
  }

  const restart = () => setState(createInitialState())

  const togglePause = () => {
    setState((s) => ({ ...s, paused: !s.paused }))
  }

  const { level, pieces, score, moves, time, mistakes, removingId, wigglingId, activeBlockers, gameOver, completed, paused, message, revived } = state

  const totalLevelPieces = LEVELS[level].length
  const solvedCount = totalLevelPieces - pieces.length
  const progressPercent = Math.round((solvedCount / totalLevelPieces) * 100)

  return (
    <section className={styles.game}>
      {/* ── GAME HEADER & HUD ── */}
      <div className={styles.gameTitle}>
        <div>
          <span className={styles.gameKickerBadge}>MECHANICAL PUZZLE</span>
          <h1 className={styles.arcadeGameName}>🔩 Nutcraft</h1>
          <p className={styles.arcadeGameSubtitle}>Analyze the sequence. Unscrew free bolts. Master the board.</p>
        </div>

        <div className={styles.gameTitleActions}>
          {bestScore > 0 && (
            <div className={`${styles.hud} ${styles.bestHudCard}`}>
              <div>
                <span>BEST SCORE</span>
                <strong>🏆 {bestScore.toLocaleString()}</strong>
              </div>
            </div>
          )}
          <div className={styles.hud}>
            <div>
              <span>ASSEMBLY</span>
              <strong className={styles.scoreNumber}>{level + 1} / 3</strong>
            </div>
            <div className={time > 0 && time <= 15 ? styles.hudWarning : ''}>
              <span>TIMER</span>
              <strong>{time}s</strong>
            </div>
            <div>
              <span>SCORE</span>
              <strong className={styles.scoreNumber}>{score.toLocaleString()}</strong>
            </div>
          </div>
          {!gameOver && !completed && (
            <button
              type="button"
              className={styles.pauseBtn}
              onClick={togglePause}
              aria-label={paused ? 'Resume puzzle' : 'Pause puzzle'}
            >
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
          )}
        </div>
      </div>

      {/* ── WORKBENCH ARENA ── */}
      <div className={styles.nutArena}>
        {/* Status message bar */}
        <div className={styles.nutMessage}>
          <span>{message}</span>
        </div>

        {/* Level progress bar */}
        <div className={styles.puzzleProgressWrap} aria-label={`Level ${level + 1} progress: ${progressPercent}%`}>
          <div className={styles.puzzleProgressBar} style={{ width: `${progressPercent}%` }} />
        </div>

        {/* ── WORKBENCH BOARD ── */}
        <div className={styles.workbenchBoard}>
          {/* Laser-etched grid overlay */}
          <div className={styles.workbenchGrid} aria-hidden="true" />

          {/* Header plate */}
          <div className={styles.boardTitle}>
            <span className={styles.boardTitleLevel}>LEVEL {level + 1}</span>
            <span className={styles.boardTitleDivider}>|</span>
            <span className={styles.boardTitleCount}>{pieces.length} PIECES REMAINING</span>
          </div>

          {/* Sockets in board background */}
          {LEVELS[level].map((pos) => (
            <div
              key={`socket-${pos.id}`}
              className={styles.screwSocket}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`,
              }}
              aria-hidden="true"
            >
              <div className={styles.socketThread} />
            </div>
          ))}

          {/* Machined Metallic Nuts & Bolts */}
          {pieces.map((piece) => {
            const free = isFree(piece, pieces)
            const isRemoving = removingId === piece.id
            const isWiggling = wigglingId === piece.id
            const isBlockerHint = activeBlockers.includes(piece.id)

            return (
              <button
                key={piece.id}
                type="button"
                className={`
                  ${styles.nutPiece}
                  ${styles[`bolt_${piece.color}`] || styles.bolt_crimson}
                  ${free ? styles.freePiece : styles.blockedPiece}
                  ${isRemoving ? styles.unscrewing : ''}
                  ${isWiggling ? styles.wiggle : ''}
                  ${isBlockerHint ? styles.blockerHighlight : ''}
                `.trim()}
                style={{
                  left: `${piece.x}%`,
                  top: `${piece.y}%`,
                  transform: `translate(-50%, -50%) rotate(${piece.rotation}deg)`,
                }}
                onClick={() => removePiece(piece)}
                aria-label={
                  free
                    ? `Unscrew bolt #${piece.id} (Free to remove)`
                    : `Bolt #${piece.id} is blocked. Clear blockers first.`
                }
              >
                {/* Hex bolt head with status LED */}
                <div className={styles.boltHexHead}>
                  <div className={`${styles.boltLed} ${free ? styles.boltLedFree : styles.boltLedLocked}`} />
                </div>

                {/* Knurled metallic body bar */}
                <div className={styles.boltShaft}>
                  <span className={styles.boltGroove} />
                  <span className={styles.boltGroove} />
                  <span className={styles.boltGroove} />
                </div>

                {/* Tail nut */}
                <div className={styles.boltHexHead}>
                  <div className={`${styles.boltLed} ${free ? styles.boltLedFree : styles.boltLedLocked}`} />
                </div>

                {/* Blocker alert callout badge */}
                {isBlockerHint && (
                  <div className={styles.blockerTag} aria-hidden="true">
                    ⚡ REMOVE ME FIRST
                  </div>
                )}
              </button>
            )
          })}

          {/* Center Industrial Hub Emblem */}
          <div className={styles.centerIndustrialHub} aria-hidden="true">
            <div className={styles.hubCore}>⚙️</div>
          </div>
        </div>

        {/* Workbench stats footer */}
        <div className={styles.nutStats}>
          <div className={styles.nutStatItem}>
            <span>MOVES</span>
            <strong>{moves}</strong>
          </div>
          <div className={styles.nutStatItem}>
            <span>MISTAKES</span>
            <strong className={mistakes > 0 ? styles.mistakeWarning : ''}>
              {mistakes} / 3
            </strong>
          </div>
          <div className={styles.nutStatItem}>
            <span>SOLVED</span>
            <strong>{solvedCount} / {totalLevelPieces}</strong>
          </div>
        </div>

        {/* ── PAUSED MODAL ── */}
        {paused && !gameOver && !completed && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              <small>PUZZLE PAUSED</small>
              <h2>⏸ Paused</h2>
              <p>The mechanical assembly is on standby. Plan your sequence!</p>
              <div className={styles.scoreRow}>
                <span>Current Score</span>
                <strong>{score.toLocaleString()}</strong>
              </div>
              <div className={styles.scoreRow}>
                <span>Time Remaining</span>
                <strong>{time}s</strong>
              </div>
              <div className={styles.scoreRow}>
                <span>Assembly Level</span>
                <strong>{level + 1} of 3</strong>
              </div>
              <button type="button" onClick={togglePause}>▶ Resume Puzzle</button>
              <button type="button" className={styles.secondary} onClick={restart}>↺ Restart Puzzle</button>
              <button type="button" className={styles.secondary} onClick={() => navigate('/games/nutcraft')}>✕ Exit to Menu</button>
            </div>
          </div>
        )}
      </div>

      {/* ── GAME OVER / COMPLETED MODAL ── */}
      {(gameOver || completed) && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <small>{completed ? 'ASSEMBLY COMPLETED!' : 'MECHANICAL FAILURE'}</small>
            <h2>{completed ? '🏆 MASTER CRAFTER' : `${score.toLocaleString()} Points`}</h2>
            {score > bestScore && score > 0 && (
              <div className={styles.newBestModal}>🏆 NEW PERSONAL BEST!</div>
            )}
            <div className={styles.scoreRow}>
              <span>All Assemblies Cleared</span>
              <strong>{completed ? '3 / 3' : `${level} / 3`}</strong>
            </div>
            <div className={styles.scoreRow}>
              <span>All-Time High Score</span>
              <strong>{Math.max(bestScore, score).toLocaleString()}</strong>
            </div>
            <p>
              {completed
                ? 'Congratulations! You solved all three mechanical puzzles with precision.'
                : mistakes >= 3
                ? 'Too many blocked piece mistakes triggered a system shutdown.'
                : 'Time expired before completing the puzzle.'}
            </p>
            {!completed && !revived && (
              <button type="button" onClick={revive}>🔩 Revive (+25s & Reset Mistakes)</button>
            )}
            <button type="button" onClick={restart}>↺ Play Again</button>
            <button type="button" className={styles.secondary} onClick={() => onFinish(score)}>
              💎 Claim Reward Coins →
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
