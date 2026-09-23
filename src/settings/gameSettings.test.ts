import { afterEach, describe, expect, it } from 'vitest'
import { GameEngine } from '../game/engine'
import { GAME_STATS_KEY } from '../storage/gameStats'
import {
  DEFAULT_GAME_SETTINGS,
  GAME_SETTINGS_KEY,
  getGameConfig,
  readGameSettings,
  writeGameSettings,
} from './gameSettings'

afterEach(() => window.localStorage.clear())

describe('game settings storage', () => {
  it('uses default settings when saved data is missing or invalid', () => {
    expect(readGameSettings()).toEqual(DEFAULT_GAME_SETTINGS)
    window.localStorage.setItem(GAME_SETTINGS_KEY, '{not json')
    expect(readGameSettings()).toEqual(DEFAULT_GAME_SETTINGS)
  })

  it('persists valid settings and falls back only invalid fields', () => {
    expect(writeGameSettings({ ballCount: 40, ballSpeed: 'fast', effect: 'reduced' })).toEqual({
      ballCount: 40,
      ballSpeed: 'fast',
      effect: 'reduced',
    })

    window.localStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify({ ballCount: 99, ballSpeed: 'slow', effect: 'bright' }))
    expect(readGameSettings()).toEqual({ ballCount: 30, ballSpeed: 'slow', effect: 'normal' })
  })

  it('keeps existing game statistics untouched because settings use a separate key', () => {
    const stats = { bestChain: 12, playCount: 6, recentChains: [12, 8] }
    window.localStorage.setItem(GAME_STATS_KEY, JSON.stringify(stats))

    writeGameSettings({ ballCount: 20, ballSpeed: 'slow', effect: 'reduced' })

    expect(JSON.parse(window.localStorage.getItem(GAME_STATS_KEY) ?? 'null')).toEqual(stats)
  })

  it('applies ball count and speed multiplier without changing the base configuration', () => {
    const slowConfig = getGameConfig({ ballCount: 20, ballSpeed: 'slow', effect: 'normal' })
    const fastConfig = getGameConfig({ ballCount: 40, ballSpeed: 'fast', effect: 'normal' })

    expect(slowConfig.ballCount).toBe(20)
    expect(slowConfig.minSpeed).toBeCloseTo(42 * 0.72)
    expect(slowConfig.maxSpeed).toBeCloseTo(86 * 0.72)
    expect(fastConfig.ballCount).toBe(40)
    expect(fastConfig.minSpeed).toBeCloseTo(42 * 1.35)
    expect(fastConfig.maxSpeed).toBeCloseTo(86 * 1.35)
    expect(new GameEngine({ width: 800, height: 600, config: slowConfig }).getSnapshot().balls).toHaveLength(20)
    expect(new GameEngine({ width: 800, height: 600, config: fastConfig }).getSnapshot().balls).toHaveLength(40)
  })
})
