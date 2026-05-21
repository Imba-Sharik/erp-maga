/** Доп. имена для мок-селекта, если в загруженных проектах мало уникальных менеджеров. */
export const MOCK_EXTRA_MANAGERS = ['Петров Пётр Петрович', 'Сидоров Сидор Сидорович'] as const

export function buildManagerSelectOptions(
  managerOptions: string[],
  currentManager: string,
): string[] {
  const names = new Set<string>(managerOptions)
  if (currentManager) names.add(currentManager)
  for (const name of MOCK_EXTRA_MANAGERS) names.add(name)
  return [...names].sort((a, b) => a.localeCompare(b, 'ru'))
}
