import type { Bag } from './money'

export interface SpendRecord {
  ts: number
  amount: number
  category: string
  note?: string
}

export interface AppState {
  bags: Bag[]
  wallet: number
  log: SpendRecord[]
}

const KEY = 'meshochki-v1'

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (Array.isArray(parsed.bags) && typeof parsed.wallet === 'number') {
        if (!Array.isArray(parsed.log)) parsed.log = []
        return parsed
      }
    }
  } catch {
    // битые данные — начинаем с чистого хранилища
  }
  return { bags: [], wallet: 0, log: [] }
}

export function saveState(state: AppState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}
