export function formatTelegramUsername(username: string | undefined | null): string | null {
  const trimmed = username?.trim()
  if (!trimmed) return null

  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`
}
