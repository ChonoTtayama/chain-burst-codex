export interface GameStats {
  bestChain: number
  playCount: number
  recentChains: number[]
}

export const GAME_STATS_KEY = 'chain-burst:stats:v1'
export const HISTORY_LIMIT = 10

const emptyStats = (): GameStats => ({ bestChain: 0, playCount: 0, recentChains: [] })

function normalizeScore(value: unknown): number | null {
  return Number.isFinite(value) && typeof value === 'number' && value >= 0 ? Math.floor(value) : null
}

function normalizeHistory(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return value
    .map(normalizeScore)
    .filter((score): score is number => score !== null)
    .slice(0, HISTORY_LIMIT)
}

function normalize(value: unknown): GameStats {
  if (!value || typeof value !== 'object') return emptyStats()
  const candidate = value as Partial<GameStats>
  return {
    bestChain: normalizeScore(candidate.bestChain) ?? 0,
    playCount: normalizeScore(candidate.playCount) ?? 0,
    recentChains: normalizeHistory(candidate.recentChains),
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
  const score = normalizeScore(chain) ?? 0
  return writeGameStats({ ...current, bestChain: Math.max(current.bestChain, score) })
}

/** Saves a completed play, keeping the newest ten scores first. */
export function recordCompletedPlay(chain: number): GameStats {
  const current = readGameStats()
  const score = normalizeScore(chain) ?? 0
  return writeGameStats({
    ...current,
    bestChain: Math.max(current.bestChain, score),
    recentChains: [score, ...current.recentChains].slice(0, HISTORY_LIMIT),
  })
}
