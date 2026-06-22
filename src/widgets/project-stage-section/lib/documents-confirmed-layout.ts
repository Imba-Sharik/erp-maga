import type { ProjectStage, StageFormData } from '@/entities/project'
import type { UserRole } from '@/entities/user-role'
import { DOC_PAIR_BY_STATUS_FIELD, STAGE_DOCUMENTS } from '@/entities/project-document'

import type { StageFieldConfig } from './fields-map'

export function isDocumentStatusField(name: keyof StageFormData): boolean {
  return name in DOC_PAIR_BY_STATUS_FIELD
}

/** У бухгалтера upload рендерится в одной ячейке со статусом — отдельные document-поля в сетке скрываем. */
export function filterDocumentsConfirmedGridFields(
  fields: StageFieldConfig[],
  stage: ProjectStage,
  role: UserRole,
): StageFieldConfig[] {
  if (stage === 'documents_confirmed' && role === 'accountant') {
    return fields.filter((f) => f.type !== 'document')
  }
  return fields
}

/** Поля формы бухгалтера: статусы + скрытые fileName для RHF. */
export function getDocumentsConfirmedFormFields(
  allFields: StageFieldConfig[],
  visibleFields: StageFieldConfig[],
  stage: ProjectStage,
  role: UserRole,
): StageFieldConfig[] {
  const editable = visibleFields.filter((f) => f.source !== 'system')
  if (stage !== 'documents_confirmed' || role !== 'accountant') return editable

  const names = new Set(editable.map((f) => f.name))
  const hiddenFileFields = allFields.filter((f) => f.type === 'document' && !names.has(f.name))
  return [...editable, ...hiddenFileFields]
}

/** Группирует видимые поля этапа по типу документа (порядок — как в fields-map). */
export function groupDocumentsConfirmedFields(fields: StageFieldConfig[]): StageFieldConfig[][] {
  const fieldByName = new Map(fields.map((f) => [f.name, f]))
  const groups: StageFieldConfig[][] = []

  for (const doc of STAGE_DOCUMENTS) {
    const group: StageFieldConfig[] = []
    for (const key of [doc.statusKey, doc.fileNameKey, doc.confirmedAtKey, doc.confirmedByKey]) {
      const field = fieldByName.get(key)
      if (field) group.push(field)
    }
    if (group.length > 0) groups.push(group)
  }

  return groups
}
