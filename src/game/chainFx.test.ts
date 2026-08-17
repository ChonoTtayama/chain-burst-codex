import { describe, expect, it } from 'vitest'
import { getChainVisualTier } from './chainFx'

describe('chain visual tiers', () => {
  it('uses the intended display milestone at each chain threshold', () => {
    expect(getChainVisualTier(0)).toBe('base')
    expect(getChainVisualTier(2)).toBe('base')
    expect(getChainVisualTier(3)).toBe('rising')
    expect(getChainVisualTier(5)).toBe('rising')
    expect(getChainVisualTier(6)).toBe('surge')
    expect(getChainVisualTier(9)).toBe('surge')
    expect(getChainVisualTier(10)).toBe('overdrive')
  })
})
