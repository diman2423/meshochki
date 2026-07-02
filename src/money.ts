export const DENOMS = [50000, 10000, 5000, 1000] as const
export type Denom = (typeof DENOMS)[number]

export interface Bag {
  id: string
  value: Denom
}

// Доли номиналов при раскладке инкама: не жадный размен (100к = 2×50к),
// а «живой» набор мешков, которым можно платить без постоянных разменов.
const SHARES: Record<Denom, number> = {
  50000: 0.5,
  10000: 0.3,
  5000: 0.15,
  1000: 0.05,
}

export function breakdown(amount: number): { values: Denom[]; change: number } {
  const values: Denom[] = []
  let rest = Math.floor(amount)
  for (const d of DENOMS) {
    const count = Math.floor((amount * SHARES[d]) / d)
    for (let i = 0; i < count && rest >= d; i++) {
      values.push(d)
      rest -= d
    }
  }
  for (const d of DENOMS) {
    while (rest >= d) {
      values.push(d)
      rest -= d
    }
  }
  values.sort((a, b) => b - a)
  return { values, change: rest }
}

const SPLITS: Partial<Record<Denom, Denom[]>> = {
  50000: [10000, 10000, 10000, 10000, 10000],
  10000: [5000, 5000],
  5000: [1000, 1000, 1000, 1000, 1000],
}

export function splitValues(value: Denom): Denom[] | null {
  return SPLITS[value] ?? null
}

export function makeBag(value: Denom): Bag {
  return { id: crypto.randomUUID(), value }
}
