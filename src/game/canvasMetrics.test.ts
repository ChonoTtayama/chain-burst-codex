import { describe, expect, it } from 'vitest'
import { getCanvasMetrics } from './canvasMetrics'

describe('canvas metrics', () => {
  it('uses one logical tablet field size for the engine and high-density backing store', () => {
    expect(getCanvasMetrics(834, 620, 2)).toEqual({
      width: 834,
      height: 620,
      pixelRatio: 2,
      backingWidth: 1668,
      backingHeight: 1240,
    })
  })

  it('keeps a desktop field and backing store in the same coordinate space', () => {
    expect(getCanvasMetrics(1048, 567, 2)).toEqual({
      width: 1048,
      height: 567,
      pixelRatio: 2,
      backingWidth: 2096,
      backingHeight: 1134,
    })
  })

  it('keeps the field usable when a transient layout measurement is zero', () => {
    expect(getCanvasMetrics(0, 0, 3)).toEqual({
      width: 1,
      height: 1,
      pixelRatio: 2,
      backingWidth: 2,
      backingHeight: 2,
    })
  })
})
