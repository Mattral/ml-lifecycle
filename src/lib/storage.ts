/**
 * Safely read from localStorage with fallback.
 */
export function getLocalStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely write to localStorage.
 */
export function setLocalStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private browsing) — fail silently
  }
}

/**
 * Safely remove from localStorage.
 */
export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // fail silently
  }
}
