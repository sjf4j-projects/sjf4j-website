import type { BenchmarkId } from '../i18n/types'

// Measured speedups are shared by every locale; only labels and explanations are translated.
export const highlights: Array<{ id: BenchmarkId; speedup: string }> = [
  { id: 'binding', speedup: '1.21×' },
  { id: 'native', speedup: '1.35×' },
  { id: 'navigation', speedup: '54.11×' },
  { id: 'validation', speedup: '53.6×' },
  { id: 'mapping', speedup: '1.31×' },
  { id: 'jdbc', speedup: '16.03×' }
]
