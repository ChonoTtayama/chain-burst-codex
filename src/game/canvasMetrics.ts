export interface CanvasMetrics {
  width: number
  height: number
  pixelRatio: number
  backingWidth: number
  backingHeight: number
}

/**
 * Keeps the CSS game field, engine coordinate space and canvas backing store
 * derived from one measurement.
 */
export function getCanvasMetrics(cssWidth: number, cssHeight: number, devicePixelRatio: number): CanvasMetrics {
  const width = Math.max(1, Math.round(cssWidth))
  const height = Math.max(1, Math.round(cssHeight))
  const pixelRatio = Math.min(Math.max(devicePixelRatio || 1, 1), 2)

  return {
    width,
    height,
    pixelRatio,
    backingWidth: Math.round(width * pixelRatio),
    backingHeight: Math.round(height * pixelRatio),
  }
}
