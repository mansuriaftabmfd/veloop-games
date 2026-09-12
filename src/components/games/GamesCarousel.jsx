import { useEffect, useMemo, useRef, useState } from 'react'
import GameCard from './GameCard.jsx'
import CarouselDots from './CarouselDots.jsx'
import styles from './GamesCarousel.module.css'

export default function GamesCarousel({ games, category = 'All' }) {
  // Carousel marquee is ONLY active for the 'All' category
  const isCarousel = category === 'All' && games.length > 0

  const trackRef = useRef(null)
  const pausedRef = useRef(false)
  const isPointerDownRef = useRef(false)
  const activeRef = useRef(0)
  const startXRef = useRef(0)
  const scrollStartLeftRef = useRef(0)
  const hasMovedRef = useRef(false)
  const pauseTimeoutRef = useRef(null)
  const rafRef = useRef(null)
  const scrollPosRef = useRef(0)

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
    if (!track) return 320
    const first = track.querySelector('[data-game-card]')
    if (!first) return 320
    const gap = parseFloat(getComputedStyle(track).gap || '20')
    const width = first.getBoundingClientRect().width
    return (width > 0 ? width : 300) + (isNaN(gap) ? 20 : gap)
  }

  const scrollToGame = (index) => {
    const track = trackRef.current
    if (!track) return
    pauseAutoScroll(4500)
    const step = getStepWidth()
    const targetScroll = index * step
    track.scrollTo({ left: targetScroll, behavior: 'smooth' })
    scrollPosRef.current = targetScroll
    setActive(index)
    activeRef.current = index
  }

  // When games <= 3 (e.g. Strategy with 2 games): each game is rendered ONCE, no duplicates.
  // When games > 3 (e.g. All with 12 games): duplicated for seamless infinite marquee.
  const displayGames = useMemo(() => {
    if (!games || games.length === 0) return []
    if (!isCarousel) {
      return games.map((g) => ({
        game: g,
        uniqueKey: String(g.id),
        isOriginal: true,
      }))
    }
    const repeatCount = games.length <= 5 ? 3 : 2
    const list = []
    for (let r = 0; r < repeatCount; r++) {
      for (let i = 0; i < games.length; i++) {
        list.push({
          game: games[i],
          uniqueKey: `${games[i].id}-rep${r}-idx${i}`,
          isOriginal: r === 0,
        })
      }
    }
    return list
  }, [games, isCarousel])

  // Continuous marquee on desktop ONLY when isCarousel is true
  useEffect(() => {
    const track = trackRef.current
    if (!track || !games || games.length === 0) return

    track.scrollLeft = 0
    scrollPosRef.current = 0
    setActive(0)
    activeRef.current = 0

    if (!isCarousel) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    let previous = performance.now()
    const tick = (now) => {
      const dt = Math.min(32, now - previous)
      previous = now

      if (!pausedRef.current && !isPointerDownRef.current && trackRef.current) {
        const step = getStepWidth()
        const cycleWidth = games.length * step

        scrollPosRef.current += dt * 0.038

        if (cycleWidth > 0 && scrollPosRef.current >= cycleWidth) {
          scrollPosRef.current -= cycleWidth
        }

        trackRef.current.scrollLeft = scrollPosRef.current
      } else if (trackRef.current) {
        scrollPosRef.current = trackRef.current.scrollLeft
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [games, isCarousel])

  // Track scroll event to update active dot indicator
  const handleScroll = () => {
    const track = trackRef.current
    if (!track || !isCarousel || games.length === 0) return
    const step = getStepWidth()
    if (step <= 0) return
    const current = Math.round(track.scrollLeft / step) % games.length
    if (current !== activeRef.current && current >= 0 && current < games.length) {
      setActive(current)
      activeRef.current = current
    }
  }

  // Keyboard navigation (only for carousel)
  useEffect(() => {
    if (!isCarousel) return
    const handleKey = (e) => {
      if (!trackRef.current || games.length === 0) return
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
  }, [games, isCarousel])

  // ── MOUSE POINTER DRAG (only for carousel) ──
  const handlePointerDown = (e) => {
    if (!isCarousel) return
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
    if (!isCarousel || !isPointerDownRef.current) return
    const track = trackRef.current
    if (!track) return

    const dx = e.clientX - startXRef.current
    if (Math.abs(dx) > 6) {
      hasMovedRef.current = true
    }
    const newLeft = scrollStartLeftRef.current - dx
    track.scrollLeft = newLeft
    scrollPosRef.current = newLeft
  }

  const handlePointerUp = () => {
    if (!isCarousel || !isPointerDownRef.current) return
    isPointerDownRef.current = false
    setIsDragging(false)

    const track = trackRef.current
    if (track && hasMovedRef.current && games.length > 0) {
      const step = getStepWidth()
      if (step > 0) {
        const cycleWidth = games.length * step
        let normalized = track.scrollLeft
        if (cycleWidth > 0 && normalized >= cycleWidth) {
          normalized = normalized % cycleWidth
        }
        const target = Math.round(normalized / step) % games.length
        scrollToGame(target)
      }
    }

    pauseAutoScroll(3500)
  }

  // Prevent card click when user was dragging
  const handleClickCapture = (e) => {
    if (hasMovedRef.current) {
      e.preventDefault()
      e.stopPropagation()
      hasMovedRef.current = false
    }
  }

  const handleMouseEnter = () => {
    if (isCarousel) pausedRef.current = true
  }

  const handleMouseLeave = () => {
    if (isCarousel && !isPointerDownRef.current) {
      pausedRef.current = false
    }
  }

  return (
    <>
      <div
        ref={trackRef}
        className={`${styles.track} ${!isCarousel ? styles.staticTrack : ''} ${isDragging ? styles.isDragging : ''}`}
        onScroll={isCarousel ? handleScroll : undefined}
        onPointerDown={isCarousel ? handlePointerDown : undefined}
        onPointerMove={isCarousel ? handlePointerMove : undefined}
        onPointerUp={isCarousel ? handlePointerUp : undefined}
        onPointerCancel={isCarousel ? handlePointerUp : undefined}
        onMouseEnter={isCarousel ? handleMouseEnter : undefined}
        onMouseLeave={isCarousel ? handleMouseLeave : undefined}
        onTouchStart={isCarousel ? () => pauseAutoScroll(4000) : undefined}
        onTouchEnd={isCarousel ? () => pauseAutoScroll(3000) : undefined}
        onClickCapture={handleClickCapture}
        aria-label="Games collection"
        tabIndex={0}
        role="region"
      >
        {displayGames.map((item) => (
          <GameCard
            key={item.uniqueKey}
            game={item.game}
            ariaHidden={!item.isOriginal ? 'true' : undefined}
          />
        ))}
      </div>
      {isCarousel && <CarouselDots count={games.length} active={active} onSelect={scrollToGame} />}
    </>
  )
}
