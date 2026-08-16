export interface GameStats {
  bestChain: number
  playCount: number
}

export const GAME_STATS_KEY = 'chain-burst:stats:v1'

const emptyStats = (): GameStats => ({ bestChain: 0, playCount: 0 })

function normalize(value: unknown): GameStats {
  if (!value || typeof value !== 'object') return emptyStats()
  const candidate = value as Partial<GameStats>
  return {
    bestChain: Number.isFinite(candidate.bestChain) && candidate.bestChain! >= 0 ? Math.floor(candidate.bestChain!) : 0,
    playCount: Number.isFinite(candidate.playCount) && candidate.playCount! >= 0 ? Math.floor(candidate.playCount!) : 0,
  }
}

export function readGameStats(): GameStats {
  try {
    return normalize(JSON.parse(window.localStorage.getItem(GAME_STATS_KEY) ?? 'null'))
  } catch {
    return emptyStats()
  }
}

export function writeGameStats(stats: GameStats): GameStats {
  const normalized = normalize(stats)
  try {
    window.localStorage.setItem(GAME_STATS_KEY, JSON.stringify(normalized))
  } catch {
    // The game remains playable when storage is unavailable (for example, private browsing restrictions).
  }
  return normalized
}

export function recordPlay(): GameStats {
  const current = readGameStats()
  return writeGameStats({ ...current, playCount: current.playCount + 1 })
}

export function recordBestChain(chain: number): GameStats {
  const current = readGameStats()
  return writeGameStats({ ...current, bestChain: Math.max(current.bestChain, Math.floor(chain)) })
}
