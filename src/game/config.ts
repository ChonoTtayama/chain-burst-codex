/** Game-balance values are intentionally centralized here. */
export const GAME_CONFIG = {
  ballCount: 30,
  ballRadiusMin: 6,
  ballRadiusMax: 10,
  minSpeed: 42,
  maxSpeed: 86,
  explosionMaxRadius: 120,
  explosionExpandMs: 260,
  explosionHoldMs: 380,
  explosionShrinkMs: 420,
} as const

export interface GameConfig {
  ballCount: number
  ballRadiusMin: number
  ballRadiusMax: number
  minSpeed: number
  maxSpeed: number
  explosionMaxRadius: number
  explosionExpandMs: number
  explosionHoldMs: number
  explosionShrinkMs: number
}
