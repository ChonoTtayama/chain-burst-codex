import { useEffect, useRef } from 'react'
import { getCanvasMetrics } from '../game/canvasMetrics'
import type { GameConfig } from '../game/config'
import { GameEngine } from '../game/engine'
import { renderGame } from '../game/renderer'
import type { GamePhase } from '../game/types'
import type { EffectLevel } from '../settings/gameSettings'

interface GameCanvasProps {
  gameConfig: GameConfig
  effect: EffectLevel
  onChainChange: (chain: number) => void
  onPhaseChange: (phase: GamePhase) => void
  onLaunch: () => void
}

export function GameCanvas({ gameConfig, effect, onChainChange, onPhaseChange, onLaunch }: GameCanvasProps) {
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
    let pixelRatio = 1

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
      renderGame(context, width, height, pixelRatio, engine, engine.getSnapshot(), effect)
    }

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const metrics = getCanvasMetrics(bounds.width, bounds.height, window.devicePixelRatio)
      width = metrics.width
      height = metrics.height
      pixelRatio = metrics.pixelRatio
      canvas.width = metrics.backingWidth
      canvas.height = metrics.backingHeight

      if (engineRef.current) {
        engineRef.current.resize(width, height)
      } else {
        engineRef.current = new GameEngine({ width, height, config: gameConfig })
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
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement)
    window.visualViewport?.addEventListener('resize', resize)
    canvas.addEventListener('pointerdown', handlePointerDown)
    resize()
    notify()
    animationFrame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      window.visualViewport?.removeEventListener('resize', resize)
      canvas.removeEventListener('pointerdown', handlePointerDown)
      engineRef.current = null
    }
  }, [effect, gameConfig])

  return <canvas className="game-canvas" ref={canvasRef} aria-label="CHAIN BURST game field" />
}
