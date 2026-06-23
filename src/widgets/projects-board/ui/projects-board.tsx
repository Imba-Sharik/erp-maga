import { useMemo, useState } from 'react'

import {
  PROJECTS_SORT_DEFAULT,
  type Project,
  type ProjectAssistantManager,
} from '@/entities/project'
import { resolveVenueFilterIds, useVenueCatalog } from '@/entities/venue'
import { useChangeProjectManagers } from '@/features/change-project-manager'
import { useClaimProject } from '@/features/claim-project'
import { ProjectsBoardToolbar, buildKanbanListParams } from '@/features/kanban-board'
import {
  AssistantManagerDialog,
  AssistantMenuItems,
  type AssistantDialogMode,
} from '@/features/manage-assistant-managers'
import { MoveProjectOutsideMagDialog } from '@/features/move-project-outside-mag'
import type { BoardListParams } from '@/shared/api'
import { useDebouncedValue } from '@/shared/hooks'

import { ProjectsKanban } from './projects-kanban'

interface AssistantTarget {
  project: Project
  mode: AssistantDialogMode
  assistant?: ProjectAssistantManager
}

interface ProjectsBoardProps {
  listDateParams: BoardListParams
  onAddProject?: () => void
}

export function ProjectsBoard({ listDateParams, onAddProject }: ProjectsBoardProps) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState(PROJECTS_SORT_DEFAULT)
  const [city, setCity] = useState<string | null>(null)
  const [hall, setHall] = useState<string | null>(null)
  const [loft, setLoft] = useState<string | null>(null)
  const [plumEventStatus, setPlumEventStatus] = useState<string[]>([])
  const [outsideMagTarget, setOutsideMagTarget] = useState<Project | null>(null)
  const [assistantTarget, setAssistantTarget] = useState<AssistantTarget | null>(null)
  const debouncedSearch = useDebouncedValue(search)
  const { halls, lofts } = useVenueCatalog()
  const { submit: claimProject } = useClaimProject()
  const {
    submit: applyManagers,
    isPending: isApplyingAssistant,
    errorMessage: assistantError,
  } = useChangeProjectManagers({ onSuccess: () => setAssistantTarget(null) })

  const venueFilterIds = useMemo(
    () => resolveVenueFilterIds(loft, hall, halls, lofts),
    [loft, hall, halls, lofts],
  )

  // Поиск, статус Plum, loft/hall и город уходят на сервер через listParams.
  const listParams = useMemo(
    () =>
      buildKanbanListParams(listDateParams, {
        search: debouncedSearch,
        plumEventStatus,
        city,
        ordering: sort,
        ...venueFilterIds,
      }),
    [listDateParams, debouncedSearch, plumEventStatus, city, sort, venueFilterIds],
  )

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <ProjectsBoardToolbar
        search={search}
        sort={sort}
        city={city}
        hall={hall}
        loft={loft}
        plumEventStatus={plumEventStatus}
        onChangeSearch={setSearch}
        onChangeSort={setSort}
        onChangeCity={setCity}
        onChangeHall={setHall}
        onChangeLoft={setLoft}
        onChangePlumEventStatus={setPlumEventStatus}
        onAddProject={onAddProject}
      />
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <ProjectsKanban
          listParams={listParams}
          onClaimProject={(project) => claimProject({ project })}
          onMoveOutsideMag={setOutsideMagTarget}
          renderAssistantMenu={(project) => (
            <AssistantMenuItems
              project={project}
              onAdd={() => setAssistantTarget({ project, mode: 'add' })}
              onEdit={(assistant) => setAssistantTarget({ project, mode: 'edit', assistant })}
            />
          )}
        />
      </div>

      <MoveProjectOutsideMagDialog
        open={outsideMagTarget !== null}
        onOpenChange={(open) => {
          if (!open) setOutsideMagTarget(null)
        }}
        project={outsideMagTarget}
      />

      <AssistantManagerDialog
        open={assistantTarget !== null}
        onOpenChange={(open) => {
          if (!open) setAssistantTarget(null)
        }}
        project={assistantTarget?.project ?? null}
        mode={assistantTarget?.mode ?? 'add'}
        editingAssistant={assistantTarget?.assistant ?? null}
        isPending={isApplyingAssistant}
        errorMessage={assistantError}
        onApply={(assistants) => {
          const target = assistantTarget?.project
          if (!target) return
          applyManagers({
            project: target,
            leadId: target.leadManagerId ?? null,
            leadName: target.manager,
            assistants,
          })
        }}
      />
    </div>
  )
}
