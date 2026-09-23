import { afterEach, describe, expect, it } from 'vitest'
import {
  GAME_STATS_KEY,
  HISTORY_LIMIT,
  readGameStats,
  recordBestChain,
  recordCompletedPlay,
  recordPlay,
  writeGameStats,
} from './gameStats'

afterEach(() => window.localStorage.clear())

describe('game stats storage', () => {
  it('uses safe zero values when there is no valid saved data', () => {
    expect(readGameStats()).toEqual({ bestChain: 0, playCount: 0, recentChains: [] })
    window.localStorage.setItem(GAME_STATS_KEY, '{not json')
    expect(readGameStats()).toEqual({ bestChain: 0, playCount: 0, recentChains: [] })
  })

  it('keeps saved v1 best-chain and play-count data when history is absent', () => {
    window.localStorage.setItem(GAME_STATS_KEY, JSON.stringify({ bestChain: 8, playCount: 3 }))

    expect(readGameStats()).toEqual({ bestChain: 8, playCount: 3, recentChains: [] })
  })

  it('normalizes malformed persisted scores before the history UI uses them', () => {
    window.localStorage.setItem(
      GAME_STATS_KEY,
      JSON.stringify({ bestChain: 8.9, playCount: -2, recentChains: [8.9, -1, '7', null, 4] }),
    )

    expect(readGameStats()).toEqual({ bestChain: 8, playCount: 0, recentChains: [8, 4] })
  })

  it('persists play count and the best chain without lowering the record', () => {
    writeGameStats({ bestChain: 4, playCount: 2, recentChains: [4, 1] })
    expect(recordPlay()).toEqual({ bestChain: 4, playCount: 3, recentChains: [4, 1] })
    expect(recordBestChain(9)).toEqual({ bestChain: 9, playCount: 3, recentChains: [4, 1] })
    expect(recordBestChain(5)).toEqual({ bestChain: 9, playCount: 3, recentChains: [4, 1] })
  })

  it('stores completed scores newest first and retains only ten entries', () => {
    for (let score = 0; score <= HISTORY_LIMIT; score += 1) recordCompletedPlay(score)

    expect(readGameStats().recentChains).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(readGameStats().bestChain).toBe(10)
  })
})
