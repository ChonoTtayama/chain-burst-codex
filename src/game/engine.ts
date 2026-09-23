import { GAME_CONFIG, type GameConfig } from './config'
import type { Ball, Explosion, GamePhase, GameSnapshot } from './types'

export interface GameEngineOptions {
  width: number
  height: number
  config?: GameConfig
  random?: () => number
  initialBalls?: Ball[]
}

const MAX_FRAME_MS = 50

export class GameEngine {
  private width: number
  private height: number
  private readonly config: GameConfig
  private readonly random: () => number
  private balls: Ball[]
  private explosions: Explosion[] = []
  private phase: GamePhase = 'ready'
  private chain = 0
  private nextExplosionId = 0

  constructor({ width, height, config = GAME_CONFIG, random = Math.random, initialBalls }: GameEngineOptions) {
    this.width = width
    this.height = height
    this.config = config
    this.random = random
    this.balls = initialBalls ? initialBalls.map((ball) => ({ ...ball })) : this.createBalls()
  }

  getSnapshot(): GameSnapshot {
    return {
      phase: this.phase,
      balls: this.balls,
      explosions: this.explosions,
      chain: this.chain,
    }
  }

  /** Starts the only player-triggered explosion. Returns false after that click/tap has been used. */
  launch(x: number, y: number): boolean {
    if (this.phase !== 'ready') return false

    this.phase = 'chain'
    this.addExplosion(this.clampX(x), this.clampY(y), 'player')
    return true
  }

  update(deltaMs: number): GameSnapshot {
    const safeDelta = Math.min(Math.max(deltaMs, 0), MAX_FRAME_MS)
    const deltaSeconds = safeDelta / 1000

    for (const ball of this.balls) {
      this.moveBall(ball, deltaSeconds)
    }

    if (this.phase !== 'chain') return this.getSnapshot()

    for (const explosion of this.explosions) {
      explosion.ageMs += safeDelta
    }

    this.triggerTouchedBalls()
    this.explosions = this.explosions.filter((explosion) => explosion.ageMs < this.explosionTotalMs)

    if (this.explosions.length === 0) {
      this.phase = 'result'
    }

    return this.getSnapshot()
  }

  resize(width: number, height: number): void {
    const nextWidth = Math.max(width, 1)
    const nextHeight = Math.max(height, 1)
    const scaleX = nextWidth / this.width
    const scaleY = nextHeight / this.height

    for (const ball of this.balls) {
      ball.x = this.clampX(ball.x * scaleX, nextWidth)
      ball.y = this.clampY(ball.y * scaleY, nextHeight)
    }
    for (const explosion of this.explosions) {
      explosion.x = this.clampX(explosion.x * scaleX, nextWidth)
      explosion.y = this.clampY(explosion.y * scaleY, nextHeight)
    }

    this.width = nextWidth
    this.height = nextHeight
  }

  getExplosionRadius(explosion: Explosion): number {
    const { explosionExpandMs, explosionHoldMs, explosionShrinkMs, explosionMaxRadius } = this.config
    const { ageMs } = explosion

    if (ageMs <= explosionExpandMs) {
      return explosionMaxRadius * (ageMs / explosionExpandMs)
    }
    if (ageMs <= explosionExpandMs + explosionHoldMs) {
      return explosionMaxRadius
    }
    const shrinkAge = ageMs - explosionExpandMs - explosionHoldMs
    return explosionMaxRadius * Math.max(0, 1 - shrinkAge / explosionShrinkMs)
  }

  private get explosionTotalMs(): number {
    return this.config.explosionExpandMs + this.config.explosionHoldMs + this.config.explosionShrinkMs
  }

  private createBalls(): Ball[] {
    return Array.from({ length: this.config.ballCount }, (_, id) => {
      const radius = this.range(this.config.ballRadiusMin, this.config.ballRadiusMax)
      const angle = this.random() * Math.PI * 2
      const speed = this.range(this.config.minSpeed, this.config.maxSpeed)
      return {
        id,
        x: this.range(radius, Math.max(radius, this.width - radius)),
        y: this.range(radius, Math.max(radius, this.height - radius)),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius,
        exploded: false,
      }
    })
  }

  private moveBall(ball: Ball, deltaSeconds: number): void {
    if (deltaSeconds === 0) return
    ball.x += ball.vx * deltaSeconds
    ball.y += ball.vy * deltaSeconds

    const minX = ball.radius
    const maxX = Math.max(minX, this.width - ball.radius)
    const minY = ball.radius
    const maxY = Math.max(minY, this.height - ball.radius)

    if (ball.x < minX) {
      ball.x = minX + (minX - ball.x)
      ball.vx = Math.abs(ball.vx)
    } else if (ball.x > maxX) {
      ball.x = maxX - (ball.x - maxX)
      ball.vx = -Math.abs(ball.vx)
    }

    if (ball.y < minY) {
      ball.y = minY + (minY - ball.y)
      ball.vy = Math.abs(ball.vy)
    } else if (ball.y > maxY) {
      ball.y = maxY - (ball.y - maxY)
      ball.vy = -Math.abs(ball.vy)
    }
  }

  private triggerTouchedBalls(): void {
    const activeExplosions = [...this.explosions]

    for (const ball of this.balls) {
      if (ball.exploded) continue

      for (const explosion of activeExplosions) {
        const radius = this.getExplosionRadius(explosion)
        const dx = ball.x - explosion.x
        const dy = ball.y - explosion.y
        const collisionDistance = radius + ball.radius

        if (dx * dx + dy * dy <= collisionDistance * collisionDistance) {
          ball.exploded = true
          this.chain += 1
          this.addExplosion(ball.x, ball.y, 'ball')
          break
        }
      }
    }
  }

  private addExplosion(x: number, y: number, kind: Explosion['kind']): void {
    this.explosions.push({ id: this.nextExplosionId++, x, y, ageMs: 0, kind })
  }

  private clampX(x: number, width = this.width): number {
    return Math.min(Math.max(x, 0), width)
  }

  private clampY(y: number, height = this.height): number {
    return Math.min(Math.max(y, 0), height)
  }

  private range(min: number, max: number): number {
    return min + this.random() * (max - min)
  }
}
