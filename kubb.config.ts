import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginZod } from '@kubb/plugin-zod'
import { pluginClient } from '@kubb/plugin-client'
import { pluginReactQuery } from '@kubb/plugin-react-query'

export default defineConfig({
  root: '.',
  input: {
    path: './openapi.yaml',
  },
  output: {
    path: './src/shared/api/generated',
    clean: true,
  },
  plugins: [
    pluginOas(),
    pluginTs({
      output: { path: './types' },
      group: { type: 'tag', name: ({ group }) => `${group}Controller` },
    }),
    pluginZod({
      output: { path: './zod' },
      typed: true,
    }),
    pluginClient({
      output: { path: './clients' },
      importPath: '@/shared/api/client',
      group: { type: 'tag' },
    }),
    pluginReactQuery({
      output: { path: './hooks' },
      client: { importPath: '@/shared/api/client' },
      group: { type: 'tag' },
      query: {
        importPath: '@tanstack/react-query',
      },
    }),
  ],
})
