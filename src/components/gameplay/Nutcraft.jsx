import { useEffect, useState } from 'react'
import { sound } from '../../utils/audio.js'
import styles from '../../pages/GamePlayPage.module.css'

const NUT_TIME = 60

const LEVELS = [
  [
    { id: 1, x: 22, y: 25, rotation: -18, color: 'red', blockers: [] },
    { id: 2, x: 54, y: 24, rotation: 15, color: 'blue', blockers: [] },
    { id: 3, x: 37, y: 45, rotation: -8, color: 'green', blockers: [1] },
    { id: 4, x: 66, y: 50, rotation: 18, color: 'orange', blockers: [2] },
    { id: 5, x: 22, y: 65, rotation: 10, color: 'purple', blockers: [1, 3] },
    { id: 6, x: 50, y: 70, rotation: -15, color: 'blue', blockers: [3, 4] },
  ],
  [
    { id: 1, x: 20, y: 22, rotation: 12, color: 'green', blockers: [] },
    { id: 2, x: 58, y: 20, rotation: -15, color: 'orange', blockers: [] },
    { id: 3, x: 40, y: 38, rotation: 5, color: 'red', blockers: [1] },
    { id: 4, x: 68, y: 45, rotation: -10, color: 'blue', blockers: [2] },
    { id: 5, x: 27, y: 58, rotation: -18, color: 'purple', blockers: [1, 3] },
    { id: 6, x: 52, y: 63, rotation: 12, color: 'green', blockers: [3, 4] },
    { id: 7, x: 75, y: 68, rotation: -12, color: 'red', blockers: [4, 6] },
  ],
  [
    { id: 1, x: 20, y: 22, rotation: -15, color: 'blue', blockers: [] },
    { id: 2, x: 55, y: 20, rotation: 15, color: 'red', blockers: [] },
    { id: 3, x: 75, y: 30, rotation: -8, color: 'green', blockers: [2] },
    { id: 4, x: 37, y: 42, rotation: 12, color: 'orange', blockers: [1] },
    { id: 5, x: 62, y: 45, rotation: -18, color: 'purple', blockers: [2, 3] },
    { id: 6, x: 20, y: 65, rotation: 15, color: 'green', blockers: [1, 4] },
    { id: 7, x: 48, y: 68, rotation: -10, color: 'red', blockers: [4, 5] },
    { id: 8, x: 75, y: 70, rotation: 14, color: 'blue', blockers: [3, 5, 7] },
  ],
]

export default function Nutcraft({ onFinish }) {
  const [level, setLevel] = useState(0)
  const [pieces, setPieces] = useState(LEVELS[0])
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(NUT_TIME)
  const [mistakes, setMistakes] = useState(0)
  const [removingId, setRemovingId] = useState(null)
  const [wigglingId, setWigglingId] = useState(null)
  const [activeBlockers, setActiveBlockers] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [revived, setRevived] = useState(false)
  const [message, setMessage] = useState('Remove free glowing pieces first!')

  useEffect(() => {
    if (gameOver || completed) return undefined

    const timer = setInterval(() => {
      setTime((current) => {
        if (current <= 1) {
          setGameOver(true)
          sound.playBlocked()
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameOver, completed])

  const isFree = (piece) => {
    return piece.blockers.every(
      (blockerId) => !pieces.some((item) => item.id === blockerId)
    )
  }

  const removePiece = (piece) => {
    if (gameOver || completed || removingId) return

    setMoves((v) => v + 1)

    if (!isFree(piece)) {
      const blockersRemaining = piece.blockers.filter((bId) =>
        pieces.some((p) => p.id === bId)
      )
      sound.playBlocked()
      setWigglingId(piece.id)
      setActiveBlockers(blockersRemaining)
      setMessage(`🔒 Blocked! Remove glowing blocker nut first.`)

      setTimeout(() => {
        setWigglingId(null)
        setActiveBlockers([])
      }, 700)

      setMistakes((val) => {
        const next = val + 1
        if (next >= 3) {
          setGameOver(true)
        }
        return next
      })
      return
    }

    sound.playUnscrew()
    setRemovingId(piece.id)
    setScore((v) => v + 50)
    setMessage('🔩 Unscrewed! +50 Points')

    setTimeout(() => {
      const remaining = pieces.filter((item) => item.id !== piece.id)
      setRemovingId(null)

      if (remaining.length === 0) {
        sound.playLevelWin()
        if (level < LEVELS.length - 1) {
          const nextLevel = level + 1
          setLevel(nextLevel)
          setPieces(LEVELS[nextLevel])
          setMessage(`🎉 Level ${nextLevel + 1} unlocked! Keep going!`)
        } else {
          setCompleted(true)
          setScore((v) => v + time * 2)
        }
      } else {
        setPieces(remaining)
      }
    }, 240)
  }

  const revive = () => {
    setRevived(true)
    setTime(25)
    setMistakes(0)
    setGameOver(false)
    setMessage('🔩 Revived! Solve the board!')
  }

  return (
    <section className={styles.game}>
      <div className={styles.gameTitle}>
        <div>
          <small>PUZZLE GAME</small>
          <h1>🔩 Nutcraft</h1>
          <p>Twist. Remove. Master.</p>
        </div>

        <div className={styles.hud}>
          <div>
            <span>Level</span>
            <strong>{level + 1}/3</strong>
          </div>

          <div>
            <span>Time</span>
            <strong>{time}s</strong>
          </div>

          <div>
            <span>Score</span>
            <strong>{score}</strong>
          </div>
        </div>
      </div>

      <div className={styles.nutArena}>
        <div className={styles.nutMessage}>{message}</div>

        <div className={styles.woodBoard}>
          <div className={styles.boardTitle}>
            LEVEL {level + 1} — {pieces.length} PIECES LEFT
          </div>

          {pieces.map((piece) => {
            const free = isFree(piece)
            const isRemoving = removingId === piece.id
            const isWiggling = wigglingId === piece.id
            const isBlockerHint = activeBlockers.includes(piece.id)

            return (
              <button
                key={piece.id}
                type="button"
                className={`
                  ${styles.nutPiece}
                  ${styles[piece.color]}
                  ${free ? styles.freePiece : styles.blockedPiece}
                  ${isRemoving ? styles.unscrewing : ''}
                  ${isWiggling ? styles.wiggle : ''}
                  ${isBlockerHint ? styles.blockerHighlight : ''}
                `}
                style={{
                  left: `${piece.x}%`,
                  top: `${piece.y}%`,
                  transform: `translate(-50%, -50%) rotate(${piece.rotation}deg)`,
                }}
                onClick={() => removePiece(piece)}
                aria-label={free ? 'Remove free nut' : 'Blocked nut'}
              >
                <span className={styles.nutHead}>✕</span>
                <span className={styles.nutBar} />
                <span className={styles.nutHead}>✕</span>
              </button>
            )
          })}

          <div className={styles.centerBolt}>🔩</div>
        </div>

        <div className={styles.nutStats}>
          <span>Moves: {moves}</span>
          <span>Mistakes: {mistakes}/3</span>
          <span>Pieces Left: {pieces.length}</span>
        </div>
      </div>

      {(gameOver || completed) && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <small>{completed ? 'PUZZLE COMPLETE' : 'GAME OVER'}</small>
            <h2>{completed ? `🏆 ${score} Points` : `Score: ${score}`}</h2>
            <p>
              {completed
                ? 'You solved all three Nutcraft puzzles!'
                : mistakes >= 3
                ? 'Too many blocked mistakes!'
                : 'Time expired before solving.'}
            </p>

            {!completed && !revived && (
              <button type="button" onClick={revive}>
                🔩 Revive (+25s & Reset Mistakes)
              </button>
            )}

            <button
              type="button"
              className={styles.secondary}
              onClick={() => onFinish(score)}
            >
              {completed ? 'Collect Reward' : 'No Thanks — Collect Reward'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
