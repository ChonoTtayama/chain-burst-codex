import { GAME_CONFIG, type GameConfig } from '../game/config'

export const BALL_COUNT_OPTIONS = [20, 30, 40] as const
export const BALL_SPEED_OPTIONS = ['slow', 'normal', 'fast'] as const
export const EFFECT_OPTIONS = ['normal', 'reduced'] as const

export type BallCount = (typeof BALL_COUNT_OPTIONS)[number]
export type BallSpeed = (typeof BALL_SPEED_OPTIONS)[number]
export type EffectLevel = (typeof EFFECT_OPTIONS)[number]

export interface GameSettings {
  ballCount: BallCount
  ballSpeed: BallSpeed
  effect: EffectLevel
}

export const GAME_SETTINGS_KEY = 'chain-burst:settings:v1'

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  ballCount: 30,
  ballSpeed: 'normal',
  effect: 'normal',
}

const speedMultipliers: Record<BallSpeed, number> = {
  slow: 0.72,
  normal: 1,
  fast: 1.35,
}

function isOption<T extends string | number>(value: unknown, options: readonly T[]): value is T {
  return options.some((option) => option === value)
}

function normalize(value: unknown): GameSettings {
  if (!value || typeof value !== 'object') return { ...DEFAULT_GAME_SETTINGS }
  const candidate = value as Partial<GameSettings>

  return {
    ballCount: isOption(candidate.ballCount, BALL_COUNT_OPTIONS) ? candidate.ballCount : DEFAULT_GAME_SETTINGS.ballCount,
    ballSpeed: isOption(candidate.ballSpeed, BALL_SPEED_OPTIONS) ? candidate.ballSpeed : DEFAULT_GAME_SETTINGS.ballSpeed,
    effect: isOption(candidate.effect, EFFECT_OPTIONS) ? candidate.effect : DEFAULT_GAME_SETTINGS.effect,
  }
}

export function readGameSettings(): GameSettings {
  try {
    return normalize(JSON.parse(window.localStorage.getItem(GAME_SETTINGS_KEY) ?? 'null'))
  } catch {
    return { ...DEFAULT_GAME_SETTINGS }
  }
}

export function writeGameSettings(settings: GameSettings): GameSettings {
  const normalized = normalize(settings)
  try {
    window.localStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify(normalized))
  } catch {
    // The game remains playable when storage is unavailable (for example, private browsing restrictions).
  }
  return normalized
}

/** Builds the per-round engine configuration from persisted player preferences. */
export function getGameConfig(settings: GameSettings): GameConfig {
  const speedMultiplier = speedMultipliers[settings.ballSpeed]
  return {
    ...GAME_CONFIG,
    ballCount: settings.ballCount,
    minSpeed: GAME_CONFIG.minSpeed * speedMultiplier,
    maxSpeed: GAME_CONFIG.maxSpeed * speedMultiplier,
  }
}
