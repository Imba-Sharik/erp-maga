import { useMemo } from 'react'

import type { ProjectDetail } from '@/entities/project'
import { DOCUMENT_STATUS_LABELS, resolveStageDocuments } from '@/entities/project-documents'
import type { StageFlow } from '@/features/advance-stage'
import { StageDocumentField } from '@/features/stage-document'

interface ProjectDocumentsProps {
  project: ProjectDetail
  getRecord: StageFlow['getRecord']
}

export function ProjectDocuments({ project, getRecord }: ProjectDocumentsProps) {
  const values = getRecord('documents_confirmed')?.values

  const items = useMemo(() => resolveStageDocuments(project, values), [project, values])

  if (items.length === 0) {
    return <p className="text-sm text-[#ACACAC]">Загруженных документов пока нет</p>
  }

  return (
    <div className="@container flex flex-col gap-4 overflow-hidden rounded-[14px] border border-[#E9E6DD] bg-white p-2.5 @xl:p-5">
      {items.map((item) => (
        <div key={item.documentType} className="flex w-full min-w-0 flex-col gap-1.5 md:max-w-sm">
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
  )
}
