import { describe, expect, it } from 'vitest'
import { GameEngine } from './engine'
import type { Ball } from './types'

const testConfig = {
  ballCount: 0,
  ballRadiusMin: 5,
  ballRadiusMax: 5,
  minSpeed: 0,
  maxSpeed: 0,
  explosionMaxRadius: 60,
  explosionExpandMs: 100,
  explosionHoldMs: 100,
  explosionShrinkMs: 100,
}

function ball(overrides: Partial<Ball> = {}): Ball {
  return {
    id: 1,
    x: 50,
    y: 50,
    vx: 0,
    vy: 0,
    radius: 5,
    exploded: false,
    ...overrides,
  }
}

describe('GameEngine', () => {
  it('reflects balls at the game-field edge', () => {
    const engine = new GameEngine({
      width: 100,
      height: 100,
      config: testConfig,
      initialBalls: [ball({ x: 90, vx: 200 })],
    })

    engine.update(50)
    const reflected = engine.getSnapshot().balls[0]

    expect(reflected.x).toBe(90)
    expect(reflected.vx).toBe(-200)
  })

  it('accepts only the first player launch', () => {
    const engine = new GameEngine({ width: 200, height: 100, config: testConfig, initialBalls: [] })

    expect(engine.launch(30, 30)).toBe(true)
    expect(engine.launch(100, 30)).toBe(false)
    expect(engine.getSnapshot().phase).toBe('chain')
    expect(engine.getSnapshot().explosions).toHaveLength(1)
  })

  it('chains through newly exploded balls without double-counting them', () => {
    const engine = new GameEngine({
      width: 250,
      height: 120,
      config: testConfig,
      initialBalls: [ball({ id: 1, x: 90 }), ball({ id: 2, x: 150 })],
    })

    engine.launch(30, 50)
    for (let index = 0; index < 12; index += 1) engine.update(50)

    expect(engine.getSnapshot().chain).toBe(2)
    expect(engine.getSnapshot().balls.every((item) => item.exploded)).toBe(true)
  })

  it('moves to RESULT after every active explosion has disappeared', () => {
    const engine = new GameEngine({ width: 200, height: 100, config: testConfig, initialBalls: [] })

    engine.launch(50, 50)
    for (let index = 0; index < 7; index += 1) engine.update(50)

    expect(engine.getSnapshot().phase).toBe('result')
  })
})
