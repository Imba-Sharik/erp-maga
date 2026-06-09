import { useMemo } from 'react'

import type { ProjectDetail } from '@/entities/project'
import { DOCUMENT_STATUS_LABELS, resolveStageDocuments } from '@/entities/project-documents'
import type { StageFlow } from '@/features/advance-stage'
import { StageDocumentField, StageEstimateField } from '@/features/stage-document'

interface ProjectDocumentsProps {
  project: ProjectDetail
  getRecord: StageFlow['getRecord']
}

const cardClassName =
  '@container flex flex-col gap-4 overflow-hidden rounded-[14px] border border-[#E9E6DD] bg-white p-2.5 @xl:p-5'

export function ProjectDocuments({ project, getRecord }: ProjectDocumentsProps) {
  const estimateFileName = getRecord('calculation_prepared')?.values?.estimateFileName ?? ''
  const values = getRecord('documents_confirmed')?.values

  const closingItems = useMemo(() => resolveStageDocuments(project, values), [project, values])

  const hasEstimate = Boolean(estimateFileName)
  const hasClosing = closingItems.length > 0

  if (!hasEstimate && !hasClosing) {
    return <p className="text-sm text-[#ACACAC]">Загруженных документов пока нет</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {hasEstimate ? (
        <div className={cardClassName}>
          <div className="flex w-full min-w-0 flex-col gap-1.5 md:max-w-sm">
            <span className="text-sm font-medium text-[#454545]">Смета</span>
            <StageEstimateField
              projectId={project.id}
              value={estimateFileName}
              interaction="download"
            />
          </div>
        </div>
      ) : null}

      {hasClosing ? (
        <div className={cardClassName}>
          {closingItems.map((item) => (
            <div
              key={item.documentType}
              className="flex w-full min-w-0 flex-col gap-1.5 md:max-w-sm"
            >
              <span className="text-sm font-medium text-[#454545]">{item.label}</span>
              <StageDocumentField
                projectId={project.id}
                documentType={item.documentType}
                value={item.fileName}
                variant={item.variant}
                interaction="download"
              />
              {item.status ? (
                <span className="text-xs text-[#ACACAC]">
                  {DOCUMENT_STATUS_LABELS[item.status] ?? item.status}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
