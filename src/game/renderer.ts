import type { GameEngine } from './engine'
import type { GameSnapshot } from './types'

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

  for (const explosion of snapshot.explosions) {
    const radius = engine.getExplosionRadius(explosion)
    if (radius <= 0) continue
    const color = explosion.kind === 'player' ? '255, 192, 74' : '100, 231, 255'
    const alpha = Math.min(0.8, 0.22 + radius / 120)

    const glow = context.createRadialGradient(explosion.x, explosion.y, 0, explosion.x, explosion.y, radius)
    glow.addColorStop(0, `rgba(${color}, ${alpha * 0.5})`)
    glow.addColorStop(0.72, `rgba(${color}, ${alpha * 0.18})`)
    glow.addColorStop(1, `rgba(${color}, 0)`)
    context.fillStyle = glow
    context.beginPath()
    context.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2)
    context.fill()

    context.strokeStyle = `rgba(${color}, ${alpha})`
    context.lineWidth = explosion.kind === 'player' ? 3 : 2
    context.beginPath()
    context.arc(explosion.x, explosion.y, Math.max(1, radius - 1), 0, Math.PI * 2)
    context.stroke()
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
