export type GamePhase = 'ready' | 'chain' | 'result'

export type ExplosionKind = 'player' | 'ball'

export interface Ball {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  exploded: boolean
}

export interface Explosion {
  id: number
  x: number
  y: number
  ageMs: number
  kind: ExplosionKind
}

export interface GameSnapshot {
  phase: GamePhase
  balls: readonly Ball[]
  explosions: readonly Explosion[]
  chain: number
}
