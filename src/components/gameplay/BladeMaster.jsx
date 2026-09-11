import { useEffect, useRef, useState } from 'react'
import { sound } from '../../utils/audio.js'
import styles from '../../pages/GamePlayPage.module.css'

const BLADE_TIME = 30

export default function BladeMaster({ onFinish }) {
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(BLADE_TIME)
  const [lives, setLives] = useState(3)
  const [knives, setKnives] = useState([])
  const [rotation, setRotation] = useState(0)
  const [recoil, setRecoil] = useState(false)
  const [combo, setCombo] = useState(0)
  const [popups, setPopups] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [revived, setRevived] = useState(false)
  const [message, setMessage] = useState('Aim anywhere on the target to throw!')

  const targetContainerRef = useRef(null)
  const rotationRef = useRef(0)
  const rafRef = useRef(null)

  // Rotating target animation loop
  useEffect(() => {
    if (gameOver) return undefined

    let last = performance.now()
    const spin = (now) => {
      const dt = (now - last) / 1000
      last = now
      rotationRef.current = (rotationRef.current + dt * 36) % 360
      setRotation(rotationRef.current)
      rafRef.current = requestAnimationFrame(spin)
    }
    rafRef.current = requestAnimationFrame(spin)
    return () => cancelAnimationFrame(rafRef.current)
  }, [gameOver])

  // Countdown timer
  useEffect(() => {
    if (gameOver) return undefined

    const timer = setInterval(() => {
      setTime((current) => {
        if (current <= 1) {
          setGameOver(true)
          sound.playCollision()
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameOver])

  const addPopup = (text, type = 'normal') => {
    const id = Date.now() + Math.random()
    setPopups((prev) => [...prev.slice(-3), { id, text, type }])
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id))
    }, 1000)
  }

  const throwKnife = (event) => {
    if (gameOver) return
    const container = targetContainerRef.current
    if (!container) return

    sound.playThrow()

    const rect = container.getBoundingClientRect()
    const scale = 320 / rect.width
    const clickX = (event.clientX - rect.left) * scale
    const clickY = (event.clientY - rect.top) * scale

    const dx = clickX - 160
    const dy = clickY - 160
    const distance = Math.hypot(dx, dy)

    // Outside the wooden board
    if (distance > 152) {
      sound.playBlocked()
      setMessage('💨 Missed the target! Aim inside the board.')
      addPopup('💨 MISSED!', 'normal')
      return
    }

    // Convert screen click into board coordinates relative to current rotation
    const screenAngleRad = Math.atan2(dy, dx)
    const currentRotRad = (rotationRef.current * Math.PI) / 180
    const boardAngleRad = screenAngleRad - currentRotRad

    const boardX = 160 + distance * Math.cos(boardAngleRad)
    const boardY = 160 + distance * Math.sin(boardAngleRad)
    const angleDeg = (boardAngleRad * 180) / Math.PI

    // Check collision against all stuck knives
    const hitKnife = knives.find((k) => {
      const distToOther = Math.hypot(k.boardX - boardX, k.boardY - boardY)
      return distToOther < 22
    })

    if (hitKnife) {
      sound.playCollision()
      setCombo(0)
      addPopup('💥 CLASH! -1 LIFE', 'error')

      setLives((val) => {
        const next = Math.max(0, val - 1)
        if (next === 0) setGameOver(true)
        return next
      })
      setMessage('💥 Hit an existing knife! Be careful.')
      return
    }

    // Hit scores based on distance from center
    let pts = 10
    let label = 'HIT! +10'
    let isPerfect = false

    if (distance <= 32) {
      pts = 40
      label = '🎯 BULLSEYE! +40'
      isPerfect = true
    } else if (distance <= 76) {
      pts = 25
      label = '⭐ INNER RING! +25'
    } else if (distance <= 116) {
      pts = 15
      label = '🔥 MIDDLE RING! +15'
    } else {
      pts = 10
      label = '⚔️ OUTER RING! +10'
    }

    // Combo bonus
    const newCombo = combo + 1
    setCombo(newCombo)
    if (newCombo >= 3) {
      const bonus = newCombo * 5
      pts += bonus
      label = `⚡ ${newCombo}x COMBO! +${pts}`
    }

    sound.playHit(isPerfect)
    setScore((s) => s + pts)
    setMessage(label)
    addPopup(label, isPerfect ? 'gold' : 'success')

    // Recoil shake effect
    setRecoil(true)
    setTimeout(() => setRecoil(false), 140)

    setKnives((current) => [
      ...current,
      {
        id: Date.now() + Math.random(),
        boardX,
        boardY,
        angleDeg,
        distance,
      },
    ])
  }

  const revive = () => {
    setRevived(true)
    setLives(2)
    setTime(15)
    setGameOver(false)
    setMessage('⚔️ Revived! Keep throwing!')
    addPopup('⚡ REVIVED +15s', 'gold')
  }

  return (
    <section className={styles.game}>
      <div className={styles.gameTitle}>
        <div>
          <small>REACTION GAME</small>
          <h1>🗡️ Blade Master</h1>
          <p>Aim anywhere on the target to throw knives</p>
        </div>

        <div className={styles.hud}>
          <div>
            <span>Score</span>
            <strong>{score}</strong>
          </div>

          <div>
            <span>Time</span>
            <strong>{time}s</strong>
          </div>

          <div className={time > 0 && time <= 10 ? styles.hudWarning : ''}>
            <span>Lives</span>
            <strong>{'♥'.repeat(lives)}{'♡'.repeat(3 - lives)}</strong>
          </div>
        </div>
      </div>

      <div className={styles.bladeArena}>
        <div className={styles.bladeMessage}>
          {message}
          {combo >= 2 && <span className={styles.comboPill}>🔥 {combo} Combo</span>}
        </div>

        {/* Floating popups */}
        <div className={styles.popupsContainer} aria-hidden="true">
          {popups.map((p) => (
            <div key={p.id} className={`${styles.popup} ${styles[p.type]}`}>
              {p.text}
            </div>
          ))}
        </div>

        {/* Target container with perfect mathematical SVG circles */}
        <div
          ref={targetContainerRef}
          className={`${styles.targetContainer} ${recoil ? styles.recoil : ''}`}
          onPointerDown={throwKnife}
          role="button"
          tabIndex={0}
          aria-label="Target board — click anywhere to throw your knife"
        >
          <svg
            viewBox="0 0 320 320"
            className={styles.targetSvg}
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="woodRim" cx="50%" cy="50%" r="50%">
                <stop offset="65%" stopColor="#5c3814" />
                <stop offset="90%" stopColor="#3d2309" />
                <stop offset="100%" stopColor="#231303" />
              </radialGradient>

              <radialGradient id="woodFace" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d89b48" />
                <stop offset="70%" stopColor="#b67a2c" />
                <stop offset="100%" stopColor="#875317" />
              </radialGradient>

              <radialGradient id="redRing" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e53935" />
                <stop offset="100%" stopColor="#b71c1c" />
              </radialGradient>

              <radialGradient id="goldRing" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffd54f" />
                <stop offset="70%" stopColor="#ffb300" />
                <stop offset="100%" stopColor="#f57f17" />
              </radialGradient>

              <radialGradient id="rubyCenter" cx="42%" cy="42%" r="58%">
                <stop offset="0%" stopColor="#ff5252" />
                <stop offset="70%" stopColor="#d50000" />
                <stop offset="100%" stopColor="#8a0000" />
              </radialGradient>

              <linearGradient id="bladeSteel" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>

              <filter id="woodShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Rotating group containing target face and all embedded knives */}
            <g
              transform={`rotate(${rotation}, 160, 160)`}
              style={{ transformOrigin: '160px 160px' }}
            >
              {/* Outer Wood Rim */}
              <circle cx="160" cy="160" r="154" fill="url(#woodRim)" filter="url(#woodShadow)" stroke="#231303" strokeWidth="4" />
              <circle cx="160" cy="160" r="148" fill="none" stroke="#794614" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />

              {/* Main Board Face */}
              <circle cx="160" cy="160" r="140" fill="url(#woodFace)" stroke="#502d08" strokeWidth="3" />

              {/* Outer Red Ring (Zone 4) */}
              <circle cx="160" cy="160" r="116" fill="url(#redRing)" stroke="#7f0000" strokeWidth="2.5" />

              {/* Middle Gold Ring (Zone 3) */}
              <circle cx="160" cy="160" r="76" fill="url(#goldRing)" stroke="#b26a00" strokeWidth="2.5" />

              {/* Inner Red Ring (Zone 2) */}
              <circle cx="160" cy="160" r="46" fill="url(#redRing)" stroke="#8f0000" strokeWidth="2" />

              {/* Bullseye Core (Zone 1) */}
              <circle cx="160" cy="160" r="22" fill="url(#rubyCenter)" stroke="#fff" strokeWidth="2" />
              <circle cx="157" cy="157" r="6" fill="#ffffff" opacity="0.6" />

              {/* Radial crosshair markings */}
              <line x1="160" y1="20" x2="160" y2="300" stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" strokeDasharray="4 6" />
              <line x1="20" y1="160" x2="300" y2="160" stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" strokeDasharray="4 6" />

              {/* Stuck Knives — rendered directly in board coordinate space */}
              {knives.map((k) => (
                <g
                  key={k.id}
                  transform={`translate(${k.boardX}, ${k.boardY}) rotate(${k.angleDeg - 90})`}
                  style={{ transformOrigin: '0 0' }}
                >
                  {/* Blade Tip embedded in target */}
                  <polygon points="0,0 -4,12 4,12" fill="#e0e0e0" stroke="#757575" strokeWidth="0.8" />

                  {/* Blade Body */}
                  <rect x="-3.5" y="12" width="7" height="18" fill="url(#bladeSteel)" stroke="#9e9e9e" strokeWidth="0.6" />
                  <line x1="0" y1="2" x2="0" y2="30" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />

                  {/* Golden Guard / Hilt */}
                  <rect x="-8" y="30" width="16" height="4" rx="1.5" fill="#f59e0b" stroke="#b45309" strokeWidth="0.8" />

                  {/* Leather Grip */}
                  <rect x="-3" y="34" width="6" height="15" rx="1.5" fill="#3e2723" stroke="#1a0e0b" strokeWidth="0.6" />
                  <circle cx="0" cy="39" r="0.8" fill="#d97706" />
                  <circle cx="0" cy="44" r="0.8" fill="#d97706" />

                  {/* Pommel */}
                  <circle cx="0" cy="51" r="3" fill="#f59e0b" stroke="#b45309" strokeWidth="0.6" />
                </g>
              ))}
            </g>
          </svg>
        </div>

        <p className={styles.bladeInstruction}>
          🎯 Click or tap anywhere on the spinning target to throw your knife
        </p>
      </div>

      {gameOver && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <small>GAME OVER</small>
            <h2>{score} Points</h2>
            <p>
              You embedded {knives.length} knives!
              {time === 0 ? ' Time ran out.' : ' Out of lives.'}
            </p>

            {!revived && (
              <button type="button" onClick={revive}>
                ⚔️ Revive (+15s & 2 Lives)
              </button>
            )}

            <button
              type="button"
              className={styles.secondary}
              onClick={() => onFinish(score)}
            >
              No Thanks — Collect Reward
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
