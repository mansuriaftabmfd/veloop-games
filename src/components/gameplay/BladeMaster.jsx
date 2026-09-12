// VELOOP Rewards — Blade Master (Arcade Edition: Projectile Physics, Canvas Sparks, Screen Shake, Fiery Combos)
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBestScore } from '../../utils/highScores.js'
import { sound } from '../../utils/audio.js'
import styles from '../../pages/GamePlayPage.module.css'

const BLADE_TIME = 30

function createInitialState() {
  return {
    score: 0,
    time: BLADE_TIME,
    lives: 3,
    knives: [],
    rotation: 0,
    combo: 0,
    popups: [],
    shake: '',
    gameOver: false,
    revived: false,
    paused: false,
    message: 'Aim anywhere on the target to throw!',
    flyingKnife: null, // { startX, startY, targetX, targetY, angle, progress }
  }
}

export default function BladeMaster({ onFinish, paused: externalPaused = false }) {
  const navigate = useNavigate()
  const [state, setState] = useState(createInitialState)
  const bestScore = getBestScore('blade-master')

  const rotationRef = useRef(0)
  const rafRef = useRef(null)
  const timerRef = useRef(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const isPausedRef = useRef(false)
  isPausedRef.current = externalPaused || state.paused || state.gameOver

  const targetContainerRef = useRef(null)
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const particleRafRef = useRef(null)

  // ── ROTATION LOOP ──
  useEffect(() => {
    if (isPausedRef.current) return

    let last = performance.now()
    const spin = (now) => {
      if (isPausedRef.current) {
        rafRef.current = requestAnimationFrame(spin)
        return
      }
      const dt = (now - last) / 1000
      last = now
      // Smooth 36 deg/sec rotation
      rotationRef.current = (rotationRef.current + dt * 36) % 360
      setState((s) => ({ ...s, rotation: rotationRef.current }))
      rafRef.current = requestAnimationFrame(spin)
    }
    rafRef.current = requestAnimationFrame(spin)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [state.paused, externalPaused, state.gameOver])

  // ── COUNTDOWN TIMER ──
  useEffect(() => {
    if (isPausedRef.current) return

    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return
      setState((s) => {
        if (s.paused || s.gameOver || externalPaused) return s
        if (s.time <= 1) {
          sound.playCollision()
          return { ...s, time: 0, gameOver: true, shake: styles.shakeClash }
        }
        return { ...s, time: s.time - 1 }
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [state.paused, externalPaused, state.gameOver])

  // ── KEYBOARD SHORTCUT: ESCAPE TO PAUSE ──
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setState((s) => {
          if (s.gameOver) return s
          return { ...s, paused: !s.paused }
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── CANVAS PARTICLE SPARK SYSTEM ──
  const spawnSparks = useCallback((x, y, scheme = 'gold', count = 25) => {
    const newParticles = []
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 5 + 2
      const size = Math.random() * 3 + 1.5
      const life = Math.random() * 0.4 + 0.4

      let color = '#F7C948'
      if (scheme === 'gold') {
        color = Math.random() > 0.3 ? '#FFD54F' : '#FF9800'
      } else if (scheme === 'clash') {
        color = Math.random() > 0.4 ? '#FF3D00' : '#FF8A80'
      } else if (scheme === 'success') {
        color = Math.random() > 0.5 ? '#00E676' : '#69F0AE'
      }

      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // slight upward bias
        size,
        color,
        life,
        maxLife: life,
      })
    }
    particlesRef.current.push(...newParticles)

    if (!particleRafRef.current) {
      let lastTime = performance.now()
      const renderParticles = (now) => {
        const dt = (now - lastTime) / 1000
        lastTime = now

        const canvas = canvasRef.current
        if (!canvas) {
          particleRafRef.current = null
          return
        }
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const remaining = []
        for (const p of particlesRef.current) {
          p.x += p.vx * 60 * dt
          p.y += p.vy * 60 * dt
          p.vy += 9.8 * dt // gravity
          p.life -= dt

          if (p.life > 0) {
            const alpha = Math.max(0, p.life / p.maxLife)
            ctx.save()
            ctx.globalAlpha = alpha
            ctx.fillStyle = p.color
            ctx.shadowColor = p.color
            ctx.shadowBlur = 8
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
            remaining.push(p)
          }
        }
        particlesRef.current = remaining

        if (remaining.length > 0) {
          particleRafRef.current = requestAnimationFrame(renderParticles)
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          particleRafRef.current = null
        }
      }
      particleRafRef.current = requestAnimationFrame(renderParticles)
    }
  }, [])

  // Floating text popup helper
  const addPopup = useCallback((text, type = 'normal') => {
    const id = Date.now() + Math.random()
    setState((s) => ({ ...s, popups: [...s.popups.slice(-3), { id, text, type }] }))
    setTimeout(() => {
      setState((s) => ({ ...s, popups: s.popups.filter((p) => p.id !== id) }))
    }, 1000)
  }, [])

  // ── THROW KNIFE HANDLER ──
  const throwKnife = useCallback((event) => {
    const s = stateRef.current
    if (s.gameOver || s.paused || externalPaused || s.flyingKnife) return
    const container = targetContainerRef.current
    if (!container) return

    sound.playThrow()

    const rect = container.getBoundingClientRect()
    const scale = 340 / rect.width
    const clickX = (event.clientX - rect.left) * scale
    const clickY = (event.clientY - rect.top) * scale

    const dx = clickX - 170
    const dy = clickY - 170
    const distance = Math.hypot(dx, dy)

    // Check if missed the board
    if (distance > 162) {
      sound.playBlocked()
      spawnSparks(clickX, clickY, 'clash', 10)
      setState((prev) => ({
        ...prev,
        message: '💨 Missed the target! Aim inside the board.',
        shake: styles.shakeHit,
      }))
      setTimeout(() => setState((prev) => ({ ...prev, shake: '' })), 150)
      addPopup('💨 MISSED!', 'normal')
      return
    }

    const screenAngleRad = Math.atan2(dy, dx)
    const currentRotRad = (rotationRef.current * Math.PI) / 180
    const boardAngleRad = screenAngleRad - currentRotRad
    const boardX = 170 + distance * Math.cos(boardAngleRad)
    const boardY = 170 + distance * Math.sin(boardAngleRad)
    const angleDeg = (boardAngleRad * 180) / Math.PI

    // Fast projectile flight simulation (70ms)
    setState((prev) => ({
      ...prev,
      flyingKnife: {
        startX: 170,
        startY: 380,
        targetX: clickX,
        targetY: clickY,
      },
    }))

    setTimeout(() => {
      setState((prev) => {
        // Clear projectile
        const nextWithoutFlying = { ...prev, flyingKnife: null }

        // Check knife collision on board
        const hitKnife = prev.knives.find((k) => Math.hypot(k.boardX - boardX, k.boardY - boardY) < 24)

        if (hitKnife) {
          sound.playCollision()
          spawnSparks(clickX, clickY, 'clash', 35)
          const nextLives = Math.max(0, prev.lives - 1)
          addPopup('💥 CLASH! -1 LIFE', 'error')
          setTimeout(() => setState((st) => ({ ...st, shake: '' })), 250)

          return {
            ...nextWithoutFlying,
            combo: 0,
            lives: nextLives,
            shake: styles.shakeClash,
            gameOver: nextLives === 0,
            message: '💥 Hit an existing blade! Be careful.',
          }
        }

        // Scoring rules
        let pts = 10
        let label = 'HIT! +10'
        let scheme = 'normal'
        let shakeStyle = styles.shakeHit

        if (distance <= 34) {
          pts = 50
          label = '🎯 BULLSEYE! +50'
          scheme = 'gold'
          shakeStyle = styles.shakeBullseye
          sound.playBullseye()
          spawnSparks(clickX, clickY, 'gold', 40)
        } else if (distance <= 80) {
          pts = 30
          label = '⭐ GOLD RING! +30'
          scheme = 'gold'
          sound.playHit(true)
          spawnSparks(clickX, clickY, 'gold', 25)
        } else if (distance <= 124) {
          pts = 20
          label = '🔥 RUBY RING! +20'
          scheme = 'success'
          sound.playHit(false)
          spawnSparks(clickX, clickY, 'success', 20)
        } else {
          pts = 10
          sound.playHit(false)
          spawnSparks(clickX, clickY, 'gold', 15)
        }

        const newCombo = prev.combo + 1
        if (newCombo >= 2) {
          const bonus = newCombo * 5
          pts += bonus
          label = `⚡ ${newCombo}x COMBO! +${pts}`
          sound.playCombo(newCombo)
        }

        addPopup(label, scheme)
        setTimeout(() => setState((st) => ({ ...st, shake: '' })), 180)

        return {
          ...nextWithoutFlying,
          score: prev.score + pts,
          combo: newCombo,
          shake: shakeStyle,
          message: label,
          knives: [
            ...prev.knives,
            { id: Date.now() + Math.random(), boardX, boardY, angleDeg, distance },
          ],
        }
      })
    }, 70)
  }, [addPopup, externalPaused, spawnSparks])

  const revive = () => {
    setState((s) => ({
      ...s,
      revived: true,
      lives: 2,
      time: 15,
      gameOver: false,
      message: '⚔️ Revived! Keep throwing!',
    }))
    addPopup('⚡ REVIVED +15s', 'gold')
  }

  const restart = () => {
    rotationRef.current = 0
    particlesRef.current = []
    setState(createInitialState())
  }

  const togglePause = () => {
    setState((s) => ({ ...s, paused: !s.paused }))
  }

  const { score, time, lives, knives, rotation, combo, popups, shake, gameOver, paused, message, revived, flyingKnife } = state

  return (
    <section className={`${styles.game} ${shake}`}>
      {/* ── HEADER & HUD ── */}
      <div className={styles.gameTitle}>
        <div>
          <span className={styles.gameKickerBadge}>PRECISION ARCADE</span>
          <h1 className={styles.arcadeGameName}>🗡️ Blade Master</h1>
          <p className={styles.arcadeGameSubtitle}>Aim anywhere on the target to throw your blades</p>
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
              <span>SCORE</span>
              <strong className={styles.scoreNumber}>{score.toLocaleString()}</strong>
            </div>
            <div className={time > 0 && time <= 10 ? styles.hudWarning : ''}>
              <span>TIMER</span>
              <strong>{time}s</strong>
            </div>
            <div>
              <span>LIVES</span>
              <strong className={styles.livesDisplay}>
                {'♥ '.repeat(lives)}{'♡ '.repeat(Math.max(0, 3 - lives))}
              </strong>
            </div>
          </div>
          {!gameOver && (
            <button
              type="button"
              className={styles.pauseBtn}
              onClick={togglePause}
              aria-label={paused ? 'Resume game' : 'Pause game'}
            >
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
          )}
        </div>
      </div>

      {/* ── BLADE ARENA ── */}
      <div className={styles.bladeArena}>
        {/* Banner message & combo streak */}
        <div className={styles.bladeMessage}>
          <span>{message}</span>
          {combo >= 2 && (
            <span className={`${styles.comboPill} ${combo >= 4 ? styles.feverMode : ''}`}>
              🔥 {combo}x {combo >= 4 ? 'FEVER STREAK!' : 'COMBO'}
            </span>
          )}
        </div>

        {/* Floating popups */}
        <div className={styles.popupsContainer} aria-hidden="true">
          {popups.map((p) => (
            <div key={p.id} className={`${styles.popup} ${styles[p.type]}`}>
              {p.text}
            </div>
          ))}
        </div>

        {/* ── TARGET CONTAINER ── */}
        <div
          ref={targetContainerRef}
          className={styles.targetContainer}
          onPointerDown={throwKnife}
          role="button"
          tabIndex={0}
          aria-label="Target board — click anywhere inside the circle to throw your knife"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              throwKnife({ clientX: 170, clientY: 170 })
            }
          }}
        >
          {/* Canvas particle spark overlay */}
          <canvas
            ref={canvasRef}
            width={340}
            height={340}
            className={styles.particleCanvas}
            aria-hidden="true"
          />

          {/* Target Board SVG */}
          <svg viewBox="0 0 340 340" className={styles.targetSvg} aria-hidden="true">
            <defs>
              {/* Outer Wood / Metallic Rim */}
              <radialGradient id="bm-woodRim" cx="50%" cy="50%" r="50%">
                <stop offset="70%" stopColor="#4A2810" />
                <stop offset="92%" stopColor="#2A1505" />
                <stop offset="100%" stopColor="#140801" />
              </radialGradient>
              {/* Target Face */}
              <radialGradient id="bm-woodFace" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#D89B48" />
                <stop offset="68%" stopColor="#B37424" />
                <stop offset="100%" stopColor="#7A4B13" />
              </radialGradient>
              {/* Ruby Ring */}
              <radialGradient id="bm-rubyRing" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E53935" />
                <stop offset="75%" stopColor="#B71C1C" />
                <stop offset="100%" stopColor="#7F0000" />
              </radialGradient>
              {/* Gold Ring */}
              <radialGradient id="bm-goldRing" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="50%" stopColor="#FFB300" />
                <stop offset="100%" stopColor="#E65100" />
              </radialGradient>
              {/* Center Jewel */}
              <radialGradient id="bm-centerJewel" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FF8A80" />
                <stop offset="50%" stopColor="#D50000" />
                <stop offset="100%" stopColor="#5B0000" />
              </radialGradient>
              {/* Steel Blade */}
              <linearGradient id="bm-bladeSteel" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="50%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#94A3B8" />
              </linearGradient>
              {/* Drop Shadow filter */}
              <filter id="bm-shadow" x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow dx="0" dy="10" stdDeviation="16" floodColor="#000000" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Rotating board container */}
            <g transform={`rotate(${rotation} 170 170)`}>
              {/* Outer Rim & Studs */}
              <circle cx="170" cy="170" r="164" fill="url(#bm-woodRim)" filter="url(#bm-shadow)" stroke="#1A0A02" strokeWidth="5" />
              <circle cx="170" cy="170" r="158" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.6" />

              {/* Brass studs around rim */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <circle
                  key={deg}
                  cx={170 + 158 * Math.cos((deg * Math.PI) / 180)}
                  cy={170 + 158 * Math.sin((deg * Math.PI) / 180)}
                  r="3.5"
                  fill="#FFD54F"
                  stroke="#8D6E63"
                  strokeWidth="1"
                />
              ))}

              {/* Concentric Game Rings */}
              <circle cx="170" cy="170" r="150" fill="url(#bm-woodFace)" stroke="#4E2703" strokeWidth="3" />
              <circle cx="170" cy="170" r="124" fill="url(#bm-rubyRing)" stroke="#5B0000" strokeWidth="3" />
              <circle cx="170" cy="170" r="82" fill="url(#bm-goldRing)" stroke="#8D5B00" strokeWidth="3" />
              <circle cx="170" cy="170" r="50" fill="url(#bm-rubyRing)" stroke="#5B0000" strokeWidth="2.5" />
              <circle cx="170" cy="170" r="24" fill="url(#bm-centerJewel)" stroke="#FFFFFF" strokeWidth="2.5" />
              {/* Bullseye specular gem gleam */}
              <circle cx="166" cy="166" r="6" fill="#FFFFFF" opacity="0.75" />

              {/* Runic markings */}
              <line x1="170" y1="20" x2="170" y2="320" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeDasharray="4 6" />
              <line x1="20" y1="170" x2="320" y2="170" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeDasharray="4 6" />

              {/* Embedded Knives */}
              {knives.map((k) => (
                <g key={k.id} transform={`translate(${k.boardX}, ${k.boardY}) rotate(${k.angleDeg - 90})`}>
                  {/* Blade Tip */}
                  <polygon points="0,0 -5,14 5,14" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.8" />
                  {/* Blade Body */}
                  <rect x="-4.5" y="14" width="9" height="20" fill="url(#bm-bladeSteel)" stroke="#94A3B8" strokeWidth="0.8" />
                  <line x1="0" y1="2" x2="0" y2="34" stroke="#FFFFFF" strokeWidth="1" opacity="0.9" />
                  {/* Crossguard */}
                  <rect x="-10" y="34" width="20" height="5" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
                  {/* Leather Wrapped Handle */}
                  <rect x="-4" y="39" width="8" height="18" rx="2" fill="#3E2723" stroke="#1A0E0B" strokeWidth="0.8" />
                  <circle cx="0" cy="44" r="1.2" fill="#D97706" />
                  <circle cx="0" cy="50" r="1.2" fill="#D97706" />
                  {/* Pommel Ring */}
                  <circle cx="0" cy="60" r="3.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
                </g>
              ))}
            </g>
          </svg>

          {/* Flying projectile animation */}
          {flyingKnife && (
            <div
              className={styles.flyingProjectile}
              style={{
                left: `${(flyingKnife.targetX / 340) * 100}%`,
                top: `${(flyingKnife.targetY / 340) * 100}%`,
              }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Ready blade in dock */}
        <div className={styles.readyBladeContainer} aria-hidden="true">
          <div className={styles.readyBlade}>
            <svg viewBox="0 0 36 72" className={styles.readyBladeSvg}>
              <polygon points="18,0 10,22 26,22" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
              <rect x="11" y="22" width="14" height="24" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
              <line x1="18" y1="4" x2="18" y2="44" stroke="#FFFFFF" strokeWidth="1.5" />
              <rect x="3" y="46" width="30" height="5" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
              <rect x="12" y="51" width="12" height="15" rx="2" fill="#5C2C16" stroke="#2E1307" strokeWidth="1" />
              <circle cx="18" cy="69" r="3.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            </svg>
          </div>
          <span className={styles.dockInstruction}>CLICK OR TAP TO LAUNCH</span>
        </div>

        {/* ── PAUSED MODAL ── */}
        {paused && !gameOver && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              <small>GAME PAUSED</small>
              <h2>⏸ Paused</h2>
              <p>Catch your breath! The spinning target awaits your next throw.</p>
              <div className={styles.scoreRow}>
                <span>Current Score</span>
                <strong>{score.toLocaleString()}</strong>
              </div>
              <div className={styles.scoreRow}>
                <span>Time Remaining</span>
                <strong>{time}s</strong>
              </div>
              <button type="button" onClick={togglePause}>▶ Resume Game</button>
              <button type="button" className={styles.secondary} onClick={restart}>↺ Restart Match</button>
              <button type="button" className={styles.secondary} onClick={() => navigate('/games/blade-master')}>✕ Exit to Menu</button>
            </div>
          </div>
        )}
      </div>

      {/* ── GAME OVER MODAL ── */}
      {gameOver && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <small>MATCH FINISHED</small>
            <h2>{score.toLocaleString()} Points</h2>
            {score > bestScore && score > 0 && (
              <div className={styles.newBestModal}>🏆 NEW PERSONAL BEST!</div>
            )}
            <div className={styles.scoreRow}>
              <span>Blades Successfully Embedded</span>
              <strong>{knives.length}</strong>
            </div>
            <div className={styles.scoreRow}>
              <span>All-Time High Score</span>
              <strong>{Math.max(bestScore, score).toLocaleString()}</strong>
            </div>
            <p>{time === 0 ? 'Time expired! Great precision.' : 'Ran out of lives from blade collisions.'}</p>
            {!revived && (
              <button type="button" onClick={revive}>⚔️ Revive (+15s & 2 Lives)</button>
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
