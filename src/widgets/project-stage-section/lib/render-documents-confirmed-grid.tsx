import type { ReactNode } from 'react'

import { StageMobileDashDivider } from '../ui/stage-mobile-dash-divider'
import { groupDocumentsConfirmedFields } from './documents-confirmed-layout'
import type { StageFieldConfig } from './fields-map'
import { renderNarrowPairs } from './render-narrow-pairs'

export function renderDocumentsConfirmedGrid(
  gridFields: StageFieldConfig[],
  renderOne: (f: StageFieldConfig) => ReactNode,
): ReactNode[] {
  const groups = groupDocumentsConfirmedFields(gridFields)

  return groups.flatMap((group, idx) => [
    ...renderNarrowPairs(group, renderOne),
    idx < groups.length - 1 ? (
      <StageMobileDashDivider key={`doc-div-${idx}`} className="col-span-1" />
    ) : null,
  ])
}
