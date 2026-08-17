/**
 * Display-only milestones for the escalating chain presentation.
 * Keeping these independent from the engine ensures visual tuning cannot alter game rules.
 */
export const CHAIN_FX_THRESHOLDS = {
  rising: 3,
  surge: 6,
  overdrive: 10,
} as const

export type ChainVisualTier = 'base' | 'rising' | 'surge' | 'overdrive'

export function getChainVisualTier(chain: number): ChainVisualTier {
  if (chain >= CHAIN_FX_THRESHOLDS.overdrive) return 'overdrive'
  if (chain >= CHAIN_FX_THRESHOLDS.surge) return 'surge'
  if (chain >= CHAIN_FX_THRESHOLDS.rising) return 'rising'
  return 'base'
}
