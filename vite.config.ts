/// <reference types="vitest/config" />
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// Штамп билда: версия — единственный источник правды в package.json; SHA и дату
// в Docker/CI прокидываем через VITE_APP_* (в контейнере .git недоступен —
// см. .dockerignore), локально SHA берём из git, иначе 'dev'.
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'))
const buildSha = (
  process.env.VITE_APP_SHA ||
  (() => {
    try {
      return execSync('git rev-parse --short HEAD').toString().trim()
    } catch {
      return 'dev'
    }
  })()
).slice(0, 7)
const buildDate = process.env.VITE_APP_BUILD_DATE || new Date().toISOString().slice(0, 10)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || env.VITE_API_URL || 'http://localhost:8000'

  return {
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __BUILD_SHA__: JSON.stringify(buildSha),
      __BUILD_DATE__: JSON.stringify(buildDate),
    },
    plugins: [
      react(),
      tailwindcss(),
      svgr({
        svgrOptions: {
          ref: true,
          dimensions: false,
          replaceAttrValues: {
            black: 'currentColor',
            '#000': 'currentColor',
            '#000000': 'currentColor',
            '#000000ff': 'currentColor',
            '#000000FF': 'currentColor',
          },
          svgo: true,
          svgoConfig: {
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    removeViewBox: false,
                  },
                },
              },
              'prefixIds',
            ],
          },
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'node',
    },
  }
})
