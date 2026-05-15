import type { ReactNode } from 'react'

import type { StageFieldConfig } from './fields-map'

/**
 * Группирует подряд идущие `narrow: true` поля попарно в отдельный wrapper.
 * Используется и в текущем этапе, и в пройденных — чтобы два узких поля
 * (например, «Номер договора» + «Дата договора») занимали одну ячейку сетки.
 */
export function renderNarrowPairs(
  fields: StageFieldConfig[],
  renderOne: (f: StageFieldConfig) => ReactNode,
  pairWrapperClassName = 'grid min-w-0 grid-cols-2 gap-x-3',
): ReactNode[] {
  const items: ReactNode[] = []
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i]
    const next = fields[i + 1]
    if (f.narrow && next?.narrow) {
      items.push(
        <div key={`${f.name}+${next.name}`} className={pairWrapperClassName}>
          {renderOne(f)}
          {renderOne(next)}
        </div>,
      )
      i++
      continue
    }
    items.push(renderOne(f))
  }
  return items
}
