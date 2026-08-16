import { useEffect, useRef } from 'react'
import { GameEngine } from '../game/engine'
import { renderGame } from '../game/renderer'
import type { GamePhase } from '../game/types'

interface GameCanvasProps {
  onChainChange: (chain: number) => void
  onPhaseChange: (phase: GamePhase) => void
  onLaunch: () => void
}

export function GameCanvas({ onChainChange, onPhaseChange, onLaunch }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GameEngine | null>(null)
  const callbacksRef = useRef({ onChainChange, onPhaseChange, onLaunch })

  callbacksRef.current = { onChainChange, onPhaseChange, onLaunch }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    let animationFrame = 0
    let lastFrameTime = performance.now()
    let lastChain = -1
    let lastPhase: GamePhase | undefined
    let width = 1
    let height = 1
    let pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

    const notify = () => {
      const snapshot = engineRef.current!.getSnapshot()
      if (snapshot.chain !== lastChain) {
        lastChain = snapshot.chain
        callbacksRef.current.onChainChange(snapshot.chain)
      }
      if (snapshot.phase !== lastPhase) {
        lastPhase = snapshot.phase
        callbacksRef.current.onPhaseChange(snapshot.phase)
      }
    }

    const draw = () => {
      const engine = engineRef.current
      if (!engine) return
      renderGame(context, width, height, pixelRatio, engine, engine.getSnapshot())
    }

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      width = Math.max(1, bounds.width)
      height = Math.max(1, bounds.height)
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)

      if (engineRef.current) {
        engineRef.current.resize(width, height)
      } else {
        engineRef.current = new GameEngine({ width, height })
      }
      draw()
    }

    const tick = (now: number) => {
      const engine = engineRef.current
      if (!engine) return
      engine.update(now - lastFrameTime)
      lastFrameTime = now
      draw()
      notify()
      if (engine.getSnapshot().phase !== 'result') {
        animationFrame = requestAnimationFrame(tick)
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      const engine = engineRef.current
      if (!engine) return
      const bounds = canvas.getBoundingClientRect()
      const launched = engine.launch(event.clientX - bounds.left, event.clientY - bounds.top)
      if (!launched) return

      event.preventDefault()
      callbacksRef.current.onLaunch()
      draw()
      notify()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    canvas.addEventListener('pointerdown', handlePointerDown)
    resize()
    notify()
    animationFrame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      canvas.removeEventListener('pointerdown', handlePointerDown)
      engineRef.current = null
    }
  }, [])

  return <canvas className="game-canvas" ref={canvasRef} aria-label="CHAIN BURST game field" />
}
