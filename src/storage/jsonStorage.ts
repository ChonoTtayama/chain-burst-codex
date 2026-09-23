/**
 * Reads and writes normalized JSON while treating browser storage as optional.
 *
 * LocalStorage can be unavailable or contain malformed data. Callers own their
 * data schema through `normalize`, so this helper stays deliberately small.
 */
export function readStoredJson<T>(key: string, normalize: (value: unknown) => T): T {
  try {
    const rawValue = window.localStorage.getItem(key)
    return normalize(rawValue === null ? null : JSON.parse(rawValue))
  } catch {
    return normalize(null)
  }
}

export function writeStoredJson<T>(key: string, value: T, normalize: (value: unknown) => T): T {
  const normalized = normalize(value)

  try {
    window.localStorage.setItem(key, JSON.stringify(normalized))
  } catch {
    // Storage is optional; the current session remains playable without it.
  }

  return normalized
}
