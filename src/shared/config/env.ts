export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  USE_MOCKS: import.meta.env.VITE_USE_MOCKS === 'true',
}
