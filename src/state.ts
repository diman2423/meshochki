import type { Bag } from './money'

export interface AppState {
  bags: Bag[]
  wallet: number
}

const KEY = 'meshochki-v1'

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (Array.isArray(parsed.bags) && typeof parsed.wallet === 'number') return parsed
    }
  } catch {
    // битые данные — начинаем с чистого хранилища
  }
  return { bags: [], wallet: 0 }
}

export function saveState(state: AppState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}
