import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/__mocks__/**',
      'src/shared/api/generated/**',
    ],
  },
  {
    files: ['./src/shared/**'],
    rules: {
      'fsd/public-api': 'off',
      // shared segments are conventionally named by type (ui, lib, api, hooks, constants, types)
      'fsd/segments-by-purpose': 'off',
    },
  },
  {
    // Heuristic rules kept as warnings rather than errors. A slice with a single consumer is
    // often a deliberate seam, not a defect; inlining all of them would bloat consumers and
    // erase meaningful boundaries. The 20-slice "excessive slicing" threshold is likewise
    // arbitrary. Surfaced as warnings so the signal stays visible without blocking on judgement.
    rules: {
      'fsd/insignificant-slice': 'warn',
      'fsd/excessive-slicing': 'warn',
    },
  },
])
