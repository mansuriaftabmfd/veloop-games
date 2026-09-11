import { useEffect, useRef, useState } from 'react'
import GameCard from './GameCard.jsx'
import CarouselDots from './CarouselDots.jsx'
import styles from './GamesCarousel.module.css'

export default function GamesCarousel({ games }) {
  const trackRef = useRef(null)
  const pausedRef = useRef(false)
  const isPointerDownRef = useRef(false)
  const activeRef = useRef(0)
  const startXRef = useRef(0)
  const scrollStartLeftRef = useRef(0)
  const hasMovedRef = useRef(false)
  const pauseTimeoutRef = useRef(null)
  const rafRef = useRef(null)

  const [active, setActive] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Sync ref with state
  activeRef.current = active

  // Helper to temporarily pause auto-scroll during user interaction
  const pauseAutoScroll = (duration = 4000) => {
    pausedRef.current = true
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current)
    pauseTimeoutRef.current = setTimeout(() => {
      pausedRef.current = false
    }, duration)
  }

  const getStepWidth = () => {
    const track = trackRef.current
    if (!track) return 300
    const first = track.querySelector('[data-game-card]')
    if (!first) return 300
    const gap = parseFloat(getComputedStyle(track).gap || '0')
    return first.getBoundingClientRect().width + gap
  }

  const scrollToGame = (index) => {
    const track = trackRef.current
    if (!track) return
    const step = getStepWidth()
    track.scrollTo({ left: index * step, behavior: 'smooth' })
    setActive(index)
    activeRef.current = index
  }

  // Auto-scroll loop: slide-by-slide on mobile (<768px), continuous marquee on desktop
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const isMobile = window.matchMedia('(max-width: 767px)').matches

    if (isMobile) {
      const interval = setInterval(() => {
        if (pausedRef.current || isPointerDownRef.current || !trackRef.current) return
        const next = (activeRef.current + 1) % games.length
        scrollToGame(next)
      }, 3200)
      return () => clearInterval(interval)
    }

    let previous = performance.now()
    const tick = (now) => {
      const dt = Math.min(32, now - previous)
      previous = now
      if (!pausedRef.current && !isPointerDownRef.current && trackRef.current) {
        trackRef.current.scrollLeft += dt * 0.032
        const half = trackRef.current.scrollWidth / 2
        if (trackRef.current.scrollLeft >= half) {
          trackRef.current.scrollLeft -= half
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [games.length])

  // Track scroll event to update active dot indicator
  const handleScroll = () => {
    const track = trackRef.current
    if (!track) return
    const step = getStepWidth()
    if (step <= 0) return
    const current = Math.round(track.scrollLeft / step) % games.length
    if (current !== activeRef.current) {
      setActive(current)
      activeRef.current = current
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (!trackRef.current) return
      if (e.key === 'ArrowRight') {
        pauseAutoScroll(4000)
        scrollToGame((activeRef.current + 1) % games.length)
      } else if (e.key === 'ArrowLeft') {
        pauseAutoScroll(4000)
        scrollToGame((activeRef.current - 1 + games.length) % games.length)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [games.length])

  // ── MOUSE POINTER DRAG (For Desktop & Emulators) ──
  const handlePointerDown = (e) => {
    // Only handle mouse dragging with left click; let touch use native high-performance scroll
    if (e.pointerType === 'touch') {
      pauseAutoScroll(4000)
      return
    }
    if (e.button !== 0) return

    const track = trackRef.current
    if (!track) return

    isPointerDownRef.current = true
    pausedRef.current = true
    hasMovedRef.current = false
    startXRef.current = e.clientX
    scrollStartLeftRef.current = track.scrollLeft
    setIsDragging(true)
  }

  const handlePointerMove = (e) => {
    if (!isPointerDownRef.current) return
    const track = trackRef.current
    if (!track) return

    const dx = e.clientX - startXRef.current
    if (Math.abs(dx) > 6) {
      hasMovedRef.current = true
    }
    track.scrollLeft = scrollStartLeftRef.current - dx
  }

  const handlePointerUp = () => {
    if (!isPointerDownRef.current) return
    isPointerDownRef.current = false
    setIsDragging(false)

    const track = trackRef.current
    if (track && hasMovedRef.current) {
      const step = getStepWidth()
      if (step > 0) {
        const target = Math.round(track.scrollLeft / step) % games.length
        scrollToGame(target)
      }
    }

    pauseAutoScroll(3000)
  }

  // Prevent card click when user was dragging
  const handleClickCapture = (e) => {
    if (hasMovedRef.current) {
      e.preventDefault()
      e.stopPropagation()
      hasMovedRef.current = false
    }
  }

  return (
    <>
      <div
        ref={trackRef}
        className={`${styles.track} ${isDragging ? styles.isDragging : ''}`}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={() => pauseAutoScroll(4000)}
        onTouchEnd={() => pauseAutoScroll(3000)}
        onClickCapture={handleClickCapture}
        aria-label="Games carousel — swipe, scroll or drag with your hand"
        tabIndex={0}
        role="region"
      >
        {[...games, ...games].map((game, index) => (
          <GameCard
            key={`${game.id}-${index}`}
            game={game}
            ariaHidden={index >= games.length ? 'true' : undefined}
          />
        ))}
      </div>
      <CarouselDots count={games.length} active={active} onSelect={scrollToGame} />
    </>
  )
}
