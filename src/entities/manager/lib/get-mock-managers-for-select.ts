import { MOCK_MANAGERS } from '../model/managers-mock'

/** TODO: replace with GET /managers/ when API is ready. */
export function getMockManagersForSelect(): string[] {
  return MOCK_MANAGERS.map((m) => m.fullName).sort((a, b) => a.localeCompare(b, 'ru'))
}
