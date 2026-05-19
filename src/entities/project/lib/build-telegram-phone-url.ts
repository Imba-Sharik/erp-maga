export function buildTelegramPhoneUrl(phone: string): string | null {
  const trimmed = phone.trim()
  if (!trimmed) return null

  let digits = trimmed.replace(/\D/g, '')
  if (!digits) return null

  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`
  } else if (digits.length === 10) {
    digits = `7${digits}`
  }

  return `https://t.me/+${digits}`
}
