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
])
