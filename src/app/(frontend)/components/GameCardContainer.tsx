'use client'

import GameCard from './GameCard'
import { useRouter } from 'next/navigation'
import { useRef, useEffect, useState } from 'react'

interface Game {
  id: string | number
  team1: string
  team2: string
  score1: string
  score2: string
  live: boolean
  championship?: string
  time?: string
}

interface GameCardContainerProps {
  title?: string
  games: Game[]
  maxTeamNameLength?: number
  autoScroll?: boolean
  scrollSpeed?: number
  pauseOnHover?: boolean
}

export const GameCardContainer = ({
  title = 'Jogos',
  games,
  maxTeamNameLength = 14,
  autoScroll = false,
  scrollSpeed = 20,
  pauseOnHover = true,
}: GameCardContainerProps) => {
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isAutoScrollActive, setIsAutoScrollActive] = useState(autoScroll)
  const dragStartXRef = useRef(0)
  const initialScrollRef = useRef(0)
  const autoScrollAnimationRef = useRef<number | null>(null)

  const performAutoScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    if (isDragging || (pauseOnHover && isHovering)) {
      autoScrollAnimationRef.current = requestAnimationFrame(performAutoScroll)
      return
    }

    const step = scrollSpeed / 20
    container.scrollLeft += step

    if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 10) {
      setTimeout(() => {
        if (container) container.scrollLeft = 0
      }, 500)
    }

    autoScrollAnimationRef.current = requestAnimationFrame(performAutoScroll)
  }

  const performAutoScrollBidirectional = () => {
    const container = scrollContainerRef.current
    if (!container) return
    if (!isAutoScrollActive || isDragging || (pauseOnHover && isHovering)) {
      autoScrollAnimationRef.current = requestAnimationFrame(performAutoScrollBidirectional)
      return
    }
    const step = scrollSpeed / 10
    if (!container.dataset.scrollDirection || container.dataset.scrollDirection === 'right') {
      container.scrollLeft += step
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
        setTimeout(() => {
          container.dataset.scrollDirection = 'left'
        }, 500)
      }
    } else {
      container.scrollLeft -= step
      if (container.scrollLeft <= 1) {
        setTimeout(() => {
          container.dataset.scrollDirection = 'right'
        }, 500)
      }
    }
    setTimeout(() => {
      autoScrollAnimationRef.current = requestAnimationFrame(performAutoScrollBidirectional)
    }, scrollSpeed * 2)
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    console.log(
      'Auto-scroll status:',
      autoScroll ? 'ativado' : 'desativado',
      'com velocidade:',
      scrollSpeed,
    )

    if (autoScrollAnimationRef.current) {
      cancelAnimationFrame(autoScrollAnimationRef.current)
      autoScrollAnimationRef.current = null
    }

    if (autoScroll) {
      setTimeout(() => {
        autoScrollAnimationRef.current = requestAnimationFrame(performAutoScrollBidirectional)
      }, 100)
    }

    return () => {
      if (autoScrollAnimationRef.current) {
        cancelAnimationFrame(autoScrollAnimationRef.current)
      }
    }
  }, [autoScroll, scrollSpeed, isDragging, isHovering, pauseOnHover])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Cancela qualquer animação em andamento
    if (autoScrollAnimationRef.current) {
      cancelAnimationFrame(autoScrollAnimationRef.current)
      autoScrollAnimationRef.current = null
    }

    return () => {
      if (autoScrollAnimationRef.current) {
        cancelAnimationFrame(autoScrollAnimationRef.current)
        autoScrollAnimationRef.current = null
      }
    }
  }, [isAutoScrollActive, autoScroll])

  // Efeito específico para monitorar mudanças no isAutoScrollActive
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || !autoScroll) return

    if (autoScrollAnimationRef.current) {
      cancelAnimationFrame(autoScrollAnimationRef.current)
      autoScrollAnimationRef.current = null
    }

    // Reinicia o auto-scroll apenas se estiver ativo
    if (isAutoScrollActive) {
      console.log('Retomando auto-scroll...')
      setTimeout(() => {
        autoScrollAnimationRef.current = requestAnimationFrame(performAutoScrollBidirectional)
      }, 100)
    } else {
      console.log('Auto-scroll está pausado')
    }

    return () => {
      if (autoScrollAnimationRef.current) {
        cancelAnimationFrame(autoScrollAnimationRef.current)
      }
    }
  }, [isAutoScrollActive, autoScroll, scrollSpeed, isDragging, isHovering, pauseOnHover])

  const startDrag = (clientX: number) => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current

    dragStartXRef.current = clientX
    initialScrollRef.current = container.scrollLeft

    setIsDragging(true)

    container.classList.add('dragging')
    document.body.style.cursor = 'grabbing'
  }

  const doDrag = (clientX: number) => {
    if (!isDragging || !scrollContainerRef.current) return

    const container = scrollContainerRef.current

    const dragDelta = dragStartXRef.current - clientX
    container.scrollLeft = initialScrollRef.current + dragDelta
  }

  const endDrag = () => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current

    setIsDragging(false)
    container.classList.remove('dragging')
    document.body.style.cursor = ''
  }

  const handleMouseDown = (e: MouseEvent) => {
    if (autoScroll && isAutoScrollActive) {
      setIsAutoScrollActive(false)
      setIsHovering(true)
      console.log('Auto-scroll pausado por interação do usuário')
    }

    startDrag(e.clientX)
  }

  const handleMouseMove = (e: MouseEvent) => {
    doDrag(e.clientX)
  }

  const handleMouseUp = () => {
    endDrag()
  }

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      if (autoScroll && isAutoScrollActive) {
        setIsAutoScrollActive(false)
        console.log('Auto-scroll pausado por toque do usuário')
      }

      // Allow native scrolling on touch devices by not preventing default here
      startDrag(e.touches[0].clientX)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      // Do not prevent default so the native horizontal scroll/momentum works on mobile
      doDrag(e.touches[0].clientX)
    }
  }

  const handleTouchEnd = () => {
    endDrag()
  }

  const handleMouseEnter = () => {
    console.log('Mouse entrou - pausando scroll')
    setIsHovering(true)
  }

  const toggleAutoScroll = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }

    // Usa callback para garantir que o estado seja atualizado corretamente
    setIsAutoScrollActive((prev) => {
      const newState = !prev
      console.log(`Auto-scroll ${newState ? 'RETOMADO' : 'PAUSADO'} manualmente`)
      return newState
    })
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('mousedown', handleMouseDown)
    // Use passive touch listeners so native scrolling isn't blocked
    container.addEventListener('touchstart', handleTouchStart, { passive: true })

    window.addEventListener('mousemove', handleMouseMove)
    // Use passive touchmove to avoid blocking the main thread and allow native scrolling
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchend', handleTouchEnd)

    if (pauseOnHover) {
      container.addEventListener('mouseenter', handleMouseEnter)
    }

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchend', handleTouchEnd)

      if (pauseOnHover) {
        container.removeEventListener('mouseenter', handleMouseEnter)
      }
    }
  }, [isDragging, pauseOnHover, autoScroll, isAutoScrollActive])

  if (!games || games.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-base font-bold flex items-center gap-1.5 group mb-2">
          <span className="w-2 h-2 bg-rcs-cta rounded-full group-hover:scale-150 transition-transform"></span>
          <span className="group-hover:text-rcs-cta transition-colors">{title}</span>
        </h3>
      )}
      <div
        ref={scrollContainerRef}
        className={`overflow-x-auto scroll-container scrollbar-rcs ${isDragging ? 'dragging' : ''}`}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          scrollBehavior: isDragging ? 'auto' : 'smooth',
        }}
      >
        <div className="flex flex-nowrap gap-3 px-0.5 py-2 min-w-max auto-scroll-content">
          {games.map((game) => (
            <div key={game.id} className="flex-none w-[220px] sm:w-[240px] transition-all">
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(`/partida/${game.id}`)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') router.push(`/partida/${game.id}`)
                }}
              >
                <GameCard
                  team1={game.team1}
                  team2={game.team2}
                  score1={game.score1}
                  score2={game.score2}
                  live={game.live}
                  championship={game.championship}
                  time={game.time}
                  maxTeamNameLength={maxTeamNameLength}
                />
              </div>
            </div>
          ))}
        </div>

        {autoScroll && (
          <div
            className={`auto-scroll-indicator ${isAutoScrollActive ? 'auto-scroll-active' : ''} !h-[0]`}
            onClick={toggleAutoScroll}
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
          >
            {isAutoScrollActive ? 'Auto' : 'Manual'}
          </div>
        )}
      </div>
    </div>
  )
}

export default GameCardContainer
