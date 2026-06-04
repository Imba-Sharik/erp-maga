import { Link2, MoreVertical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'
import { formatRelativeUpdateLabel } from '@/shared/lib/date/format-relative-update-label'
import { Card } from '@/shared/ui/card'
import { stageCardBorderClass } from '@/entities/stage-draft'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { projectDetailPath } from '../lib/project-detail-path'
import type { Project, ProjectBackOrigin } from '../model/types'
import { ProjectPlumStatusLine } from './project-plum-status-line'
import { ProjectTelegramLink } from './project-telegram-link'

interface ProjectPipelineCardProps {
  project: Project
  backOrigin?: ProjectBackOrigin
  /** Есть незавершённый черновик этапа — подсветить карточку жёлтой обводкой. */
  hasDraft?: boolean
  onMoveOutsideMag?: (project: Project) => void
  onChangeManager?: (project: Project) => void
  onDeleteProject?: (project: Project) => void
}

/**
 * Контент меню в Portal: при pointerup попап уже снят, click уходит на карточку снизу.
 * preventDefault на pointerdown у Content — рекомендация Radix для overlay над click-target.
 * @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu
 */
function preventPortalClickThrough(e: React.PointerEvent) {
  e.preventDefault()
}

export function ProjectPipelineCard({
  project,
  backOrigin,
  hasDraft,
  onMoveOutsideMag,
  onChangeManager,
  onDeleteProject,
}: ProjectPipelineCardProps) {
  const navigate = useNavigate()
  const goToDetail = () =>
    navigate(projectDetailPath(project.id, backOrigin), { state: backOrigin })
  const stop = (e: React.MouseEvent) => e.stopPropagation()
  const hasMenu = Boolean(onMoveOutsideMag ?? onChangeManager ?? onDeleteProject)

  const handleBodyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      goToDetail()
    }
  }

  return (
    <Card
      className={cn(
        'gap-1 p-2.5 shadow-none transition-colors',
        hasDraft ? null : 'bg-[#F9F9F9]',
        stageCardBorderClass(hasDraft, 'border-[#D3D3D3] hover:border-[#B1B1B1]'),
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={goToDetail}
          className="focus-visible:ring-ring/50 min-w-0 flex-1 cursor-pointer truncate rounded-sm text-left text-sm font-semibold text-[#454545] hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          {project.title}
        </button>
        {hasMenu ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Меню проекта"
                className="-m-1 shrink-0 cursor-pointer rounded p-1 text-[#454545] transition-colors hover:bg-[#E9E6DD]"
              >
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-44"
              onPointerDown={preventPortalClickThrough}
            >
              {onChangeManager ? (
                <DropdownMenuItem onSelect={() => onChangeManager(project)}>
                  Сменить менеджера
                </DropdownMenuItem>
              ) : null}
              {onMoveOutsideMag ? (
                <DropdownMenuItem variant="destructive" onSelect={() => onMoveOutsideMag(project)}>
                  Вне контура MAG
                </DropdownMenuItem>
              ) : null}
              {onDeleteProject ? (
                <DropdownMenuItem variant="destructive" onSelect={() => onDeleteProject(project)}>
                  Удалить
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={goToDetail}
        onKeyDown={handleBodyKeyDown}
        className="focus-visible:ring-ring/50 flex cursor-pointer flex-col gap-1 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        <p className="text-xs text-[#ACACAC]">
          {project.loft} · {project.hall}
        </p>
        <p className="text-xs text-[#ACACAC]">Дата мероприятия: {formatDate(project.date)}</p>
        <p className="text-xs text-[#ACACAC]">Менеджер MAG: {project.manager}</p>
        <p className="text-xs text-[#ACACAC]">Тип мероприятия: {project.type}</p>
        <p className="text-xs text-[#ACACAC]">Компания: {project.company}</p>
        <p className="text-xs text-[#ACACAC]">
          Телефон: <span className="text-funnel-preproject">{project.phone}</span>
        </p>
        <ProjectTelegramLink phone={project.phone} onClick={stop} />
        <ProjectPlumStatusLine project={project} />

        <div className="mt-1 flex items-center justify-between gap-2">
          <a
            href={project.plumCardUrl}
            target="_blank"
            rel="noreferrer"
            onClick={stop}
            className="text-funnel-preproject inline-flex items-center gap-1.5 text-xs underline-offset-2 hover:underline"
          >
            <span className="bg-funnel-preproject inline-flex size-4 items-center justify-center rounded-[5px] text-white">
              <Link2 className="size-3" />
            </span>
            Карточка в PLUM
          </a>
          <span className="text-2xs text-[#ACACAC]">
            {formatRelativeUpdateLabel(project.updatedAt)}
          </span>
        </div>
      </div>
    </Card>
  )
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}
