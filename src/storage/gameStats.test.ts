import { afterEach, describe, expect, it } from 'vitest'
import { GAME_STATS_KEY, readGameStats, recordBestChain, recordPlay, writeGameStats } from './gameStats'

afterEach(() => window.localStorage.clear())

describe('game stats storage', () => {
  it('uses safe zero values when there is no valid saved data', () => {
    expect(readGameStats()).toEqual({ bestChain: 0, playCount: 0 })
    window.localStorage.setItem(GAME_STATS_KEY, '{not json')
    expect(readGameStats()).toEqual({ bestChain: 0, playCount: 0 })
  })

  it('persists play count and the best chain without lowering the record', () => {
    writeGameStats({ bestChain: 4, playCount: 2 })
    expect(recordPlay()).toEqual({ bestChain: 4, playCount: 3 })
    expect(recordBestChain(9)).toEqual({ bestChain: 9, playCount: 3 })
    expect(recordBestChain(5)).toEqual({ bestChain: 9, playCount: 3 })
    expect(readGameStats()).toEqual({ bestChain: 9, playCount: 3 })
  })
})
