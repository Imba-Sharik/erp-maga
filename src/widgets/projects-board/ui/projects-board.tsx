import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

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
import { useDebouncedValue, useFilterParams } from '@/shared/hooks'

import { ProjectsKanban } from './projects-kanban'

/** Ключи URL, которые персистим для канбана всех проектов. */
const PROJECTS_BOARD_FILTER_KEYS = ['q', 'sort', 'city', 'hall', 'loft', 'plum'] as const

interface AssistantTarget {
  project: Project
  mode: AssistantDialogMode
  assistant?: ProjectAssistantManager
}

interface ProjectsBoardProps {
  listDateParams: BoardListParams
  onAddProject?: () => void
  /** Переключатель «канбан ⇄ таблица» — рендерится в тулбаре */
  viewModeToggle?: ReactNode
}

export function ProjectsBoard({ listDateParams, onAddProject, viewModeToggle }: ProjectsBoardProps) {
  // Фильтры/поиск/сортировка живут в URL (переживают F5, шарятся ссылкой) и дублируются в
  // localStorage (переживают закрытие вкладки / новое окно).
  const { getString, getArray, set } = useFilterParams({
    scope: 'projects-board',
    params: PROJECTS_BOARD_FILTER_KEYS,
  })
  const search = getString('q') ?? ''
  const sort = getString('sort') ?? PROJECTS_SORT_DEFAULT
  const city = getString('city')
  const hall = getString('hall')
  const loft = getString('loft')
  const plumEventStatus = getArray('plum')
  const setSearch = (value: string) => set('q', value)
  const setSort = (value: string) => set('sort', value === PROJECTS_SORT_DEFAULT ? null : value)
  const setCity = (value: string | null) => set('city', value)
  const setHall = (value: string | null) => set('hall', value)
  const setLoft = (value: string | null) => set('loft', value)
  const setPlumEventStatus = (values: string[]) => set('plum', values)
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
        viewModeToggle={viewModeToggle}
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
