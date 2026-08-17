import { getChainVisualTier, type ChainVisualTier } from './chainFx'
import type { GameEngine } from './engine'
import type { GameSnapshot } from './types'

const TIER_STYLES: Record<ChainVisualTier, { auraScale: number; glowScale: number; lineWidth: number; innerRing: boolean }> = {
  base: { auraScale: 1, glowScale: 1, lineWidth: 2, innerRing: false },
  rising: { auraScale: 1.14, glowScale: 1.28, lineWidth: 2.6, innerRing: true },
  surge: { auraScale: 1.24, glowScale: 1.5, lineWidth: 3.3, innerRing: true },
  overdrive: { auraScale: 1.35, glowScale: 1.7, lineWidth: 4.2, innerRing: true },
}

export function renderGame(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  devicePixelRatio: number,
  engine: GameEngine,
  snapshot: GameSnapshot,
): void {
  context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
  context.clearRect(0, 0, width, height)

  const background = context.createLinearGradient(0, 0, width, height)
  background.addColorStop(0, '#071a38')
  background.addColorStop(0.52, '#0b1230')
  background.addColorStop(1, '#160c30')
  context.fillStyle = background
  context.fillRect(0, 0, width, height)

  drawGrid(context, width, height)

  const visualTier = getChainVisualTier(snapshot.chain)
  const tierStyle = TIER_STYLES[visualTier]

  for (const explosion of snapshot.explosions) {
    const radius = engine.getExplosionRadius(explosion)
    if (radius <= 0) continue
    const color = getExplosionColor(explosion.kind, visualTier)
    const alpha = Math.min(0.84, (0.22 + radius / 120) * tierStyle.glowScale)
    const auraRadius = radius * tierStyle.auraScale
    const lifePulse = 1 + Math.sin(explosion.ageMs / 74) * 0.07

    const glow = context.createRadialGradient(explosion.x, explosion.y, 0, explosion.x, explosion.y, auraRadius)
    glow.addColorStop(0, `rgba(${color}, ${alpha * 0.56})`)
    glow.addColorStop(0.68, `rgba(${color}, ${alpha * 0.17})`)
    glow.addColorStop(1, `rgba(${color}, 0)`)
    context.fillStyle = glow
    context.beginPath()
    context.arc(explosion.x, explosion.y, auraRadius, 0, Math.PI * 2)
    context.fill()

    context.strokeStyle = `rgba(${color}, ${alpha})`
    context.lineWidth = (explosion.kind === 'player' ? tierStyle.lineWidth + 1 : tierStyle.lineWidth) * lifePulse
    context.beginPath()
    context.arc(explosion.x, explosion.y, Math.max(1, radius - 1), 0, Math.PI * 2)
    context.stroke()

    if (tierStyle.innerRing) {
      context.strokeStyle = `rgba(${color}, ${alpha * 0.48})`
      context.lineWidth = Math.max(1, tierStyle.lineWidth * 0.48)
      context.beginPath()
      context.arc(explosion.x, explosion.y, Math.max(1, radius * 0.72), 0, Math.PI * 2)
      context.stroke()
    }

    if (visualTier === 'overdrive' && explosion.ageMs <= 640) {
      drawOverdriveRays(context, explosion.x, explosion.y, radius, auraRadius, color, alpha)
    }
  }

  for (const ball of snapshot.balls) {
    if (ball.exploded) continue
    const ballGlow = context.createRadialGradient(
      ball.x - ball.radius * 0.3,
      ball.y - ball.radius * 0.35,
      1,
      ball.x,
      ball.y,
      ball.radius * 1.8,
    )
    ballGlow.addColorStop(0, '#effdff')
    ballGlow.addColorStop(0.38, '#70e5ff')
    ballGlow.addColorStop(1, 'rgba(41, 141, 246, 0)')
    context.fillStyle = ballGlow
    context.beginPath()
    context.arc(ball.x, ball.y, ball.radius * 1.8, 0, Math.PI * 2)
    context.fill()

    context.fillStyle = '#7ceaff'
    context.beginPath()
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    context.fill()
  }
}

function getExplosionColor(kind: 'player' | 'ball', tier: ChainVisualTier): string {
  if (tier === 'overdrive') return kind === 'player' ? '255, 214, 83' : '244, 121, 255'
  if (tier === 'surge' && kind === 'ball') return '129, 190, 255'
  return kind === 'player' ? '255, 192, 74' : '100, 231, 255'
}

function drawOverdriveRays(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  auraRadius: number,
  color: string,
  alpha: number,
): void {
  context.save()
  context.strokeStyle = `rgba(${color}, ${alpha * 0.27})`
  context.lineWidth = 1.15
  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI * 2 * index) / 8 + radius / 170
    context.beginPath()
    context.moveTo(x + Math.cos(angle) * radius * 1.03, y + Math.sin(angle) * radius * 1.03)
    context.lineTo(x + Math.cos(angle) * auraRadius * 1.18, y + Math.sin(angle) * auraRadius * 1.18)
    context.stroke()
  }
  context.restore()
}

function drawGrid(context: CanvasRenderingContext2D, width: number, height: number): void {
  const gap = 42
  context.beginPath()
  for (let x = 0; x <= width; x += gap) {
    context.moveTo(x, 0)
    context.lineTo(x, height)
  }
  for (let y = 0; y <= height; y += gap) {
    context.moveTo(0, y)
    context.lineTo(width, y)
  }
  context.strokeStyle = 'rgba(126, 192, 255, 0.055)'
  context.lineWidth = 1
  context.stroke()
}
