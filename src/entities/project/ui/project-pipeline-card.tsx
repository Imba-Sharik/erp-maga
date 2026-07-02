import { useState, type ReactNode } from 'react'
import { Building2, CalendarDays, Link2, MapPin, MoreVertical, Phone, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'
import { formatRelativeUpdateLabel } from '@/shared/lib/date'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Card } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { stageCardBorderClass } from '@/entities/stage-draft'
import { useCurrentUser } from '@/entities/current-user'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { buildTelegramPhoneUrl } from '../lib/build-telegram-phone-url'
import { hallChipNames } from '../lib/map-project-halls'
import { pluralHalls } from '../lib/plural'
import { shouldShowPlumStatusLine } from '../lib/plum-status'
import { projectDetailPath } from '../lib/project-detail-path'
import { isProjectLeadManager } from '../lib/resolve-manager-role'
import type { Project, ProjectBackOrigin } from '../model/types'

/** Сколько чипов залов показываем до сворачивания в «+N». */
const VISIBLE_HALLS = 3

interface ProjectPipelineCardProps {
  project: Project
  backOrigin?: ProjectBackOrigin
  /** Есть незавершённый черновик этапа — подсветить карточку жёлтой обводкой. */
  hasDraft?: boolean
  /** «Взять проект» — показывается только при `project.canClaim`. */
  onClaimProject?: (project: Project) => void
  onMoveOutsideMag?: (project: Project) => void
  onChangeManager?: (project: Project) => void
  onDeleteProject?: (project: Project) => void
  /**
   * Пункты меню «вспомогательные менеджеры» для ведущего (ERP-189). Инжектится
   * бордом (feature), т.к. entities не зависит от features/роли/справочника.
   */
  renderAssistantMenu?: (project: Project) => ReactNode
}

/**
 * Контент меню в Portal: при pointerup попап уже снят, click уходит на карточку снизу.
 * preventDefault на pointerdown у Content — рекомендация Radix для overlay над click-target.
 * @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu
 */
function preventPortalClickThrough(e: React.PointerEvent) {
  e.preventDefault()
}

const stop = (e: React.MouseEvent) => e.stopPropagation()

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]?.[0] ?? ''
  const second = parts.length > 1 ? (parts[1]?.[0] ?? '') : ''
  return (first + second).toUpperCase()
}

/**
 * Строка-описание с ведущей иконкой (зал, дата, компания). `strong` — тёмный
 * акцент (#454545, medium) для строки даты, как в макете; остальные — muted.
 */
function InfoLine({
  icon: Icon,
  strong,
  children,
}: {
  icon: typeof MapPin
  strong?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs',
        strong ? 'text-foreground-soft font-medium' : 'text-muted-foreground',
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="min-w-0 truncate">{children}</span>
    </div>
  )
}

/** Иконка-кнопка действия карточки (PLUM/телефон/телеграм) с тултипом. */
function CardIconAction({
  tooltip,
  href,
  external,
  ariaLabel,
  children,
}: {
  tooltip: string
  href: string
  external?: boolean
  ariaLabel: string
  children: ReactNode
}) {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <a
          href={href}
          aria-label={ariaLabel}
          onClick={stop}
          {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
          className="bg-chip-surface-neutral text-muted-foreground hover:bg-surface-hover hover:text-foreground-soft inline-flex size-5.5 shrink-0 items-center justify-center rounded-[7px] transition-colors"
        >
          {children}
        </a>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

/** Строка менеджера: аватар с тултипом роли + имя. */
function ManagerRow({ name, role }: { name: string; role: 'lead' | 'assistant' }) {
  const tooltip = role === 'lead' ? 'Ведущий менеджер' : 'Вспомогательный менеджер'
  const display = name || (role === 'lead' ? 'Нет ведущего' : '')
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <div className="flex w-fit max-w-full items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback
              className={cn(
                // Инициалы мельче (10px), заливка + сплошной бордер — как в макете.
                'group-data-[size=sm]/avatar:text-2xs border bg-none',
                !name
                  ? 'bg-avatar-empty border-avatar-empty-border border-dashed text-muted-foreground'
                  : role === 'lead'
                    ? 'bg-avatar-lead border-avatar-lead-border'
                    : 'bg-avatar-assistant border-avatar-assistant-border',
              )}
            >
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground min-w-0 truncate text-xs font-medium">
            {display}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

/** Чипы залов с раскрытием «+N» → полный список → «Свернуть». */
function HallChipsRow({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false)
  const names = hallChipNames(project)
  if (names.length === 0) return null

  const hasOverflow = names.length > VISIBLE_HALLS
  const hiddenCount = names.length - VISIBLE_HALLS
  const shown = expanded || !hasOverflow ? names : names.slice(0, VISIBLE_HALLS)

  const chip = 'inline-flex items-center rounded-[7px] bg-chip-surface-neutral px-2 py-0.5 text-xs'
  const toggle =
    'cursor-pointer text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground-soft focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none'

  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map((name, i) => (
        <span key={`${name}-${i}`} className={cn(chip, 'text-muted-foreground')}>
          {name}
        </span>
      ))}
      {hasOverflow && !expanded && (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={(e) => {
                stop(e)
                setExpanded(true)
              }}
              className={cn(chip, toggle)}
            >
              +{hiddenCount}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            Ещё {hiddenCount} {pluralHalls(hiddenCount)}
          </TooltipContent>
        </Tooltip>
      )}
      {hasOverflow && expanded && (
        <button
          type="button"
          onClick={(e) => {
            stop(e)
            setExpanded(false)
          }}
          className={cn(chip, toggle)}
        >
          Свернуть
        </button>
      )}
    </div>
  )
}

export function ProjectPipelineCard({
  project,
  backOrigin,
  hasDraft,
  onClaimProject,
  onMoveOutsideMag,
  onChangeManager,
  onDeleteProject,
  renderAssistantMenu,
}: ProjectPipelineCardProps) {
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const goToDetail = () =>
    navigate(projectDetailPath(project.id, backOrigin), { state: backOrigin })
  const canClaim = Boolean(onClaimProject && project.canClaim)
  // Проект, который пользователь не ведёт (read-only), не предлагает действий ведения.
  const canMoveOutsideMag = Boolean(onMoveOutsideMag && !project.isReadOnly)
  // Меню вспомогательных доступно только ведущему менеджеру (ERP-189).
  const assistantMenu = renderAssistantMenu?.(project)
  const canManageAssistants =
    Boolean(renderAssistantMenu) && isProjectLeadManager(project, currentUser.id)
  const hasMenu = Boolean(
    canClaim || canMoveOutsideMag || onChangeManager || onDeleteProject || canManageAssistants,
  )

  const telegramUrl = buildTelegramPhoneUrl(project.phone)
  const showPlumCard = project.isFromPlum && Boolean(project.plumCardUrl?.trim())
  const showStatus = shouldShowPlumStatusLine(project)
  const hasActions = showPlumCard || Boolean(project.phone) || Boolean(telegramUrl)
  const assistants = project.assistantManagers ?? []

  const handleBodyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      goToDetail()
    }
  }

  return (
    <Card
      className={cn(
        'gap-2 p-3 shadow-none transition-colors',
        hasDraft ? null : 'bg-surface-subtle-neutral',
        stageCardBorderClass(hasDraft, 'border-border-medium hover:border-border-strong'),
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={goToDetail}
          className="focus-visible:ring-ring/50 text-foreground-soft min-w-0 flex-1 cursor-pointer truncate rounded-sm text-left text-sm font-semibold hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          {project.title}
        </button>
        {hasMenu ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Меню проекта"
                className="text-foreground-soft hover:bg-surface-hover -m-1 shrink-0 cursor-pointer rounded p-1 transition-colors"
              >
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-44"
              onPointerDown={preventPortalClickThrough}
            >
              {canClaim ? (
                <DropdownMenuItem onSelect={() => onClaimProject?.(project)}>
                  Взять проект
                </DropdownMenuItem>
              ) : null}
              {onChangeManager ? (
                <DropdownMenuItem onSelect={() => onChangeManager(project)}>
                  Сменить менеджера
                </DropdownMenuItem>
              ) : null}
              {canMoveOutsideMag ? (
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onMoveOutsideMag?.(project)}
                >
                  Вне контура MAG
                </DropdownMenuItem>
              ) : null}
              {canManageAssistants ? assistantMenu : null}
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
        className="focus-visible:ring-ring/50 flex cursor-pointer flex-col gap-2 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        {project.loft ? <InfoLine icon={MapPin}>{project.loft}</InfoLine> : null}

        <HallChipsRow project={project} />

        <InfoLine icon={CalendarDays} strong>
          {formatDate(project.date)}
          {project.type ? ` · ${project.type}` : null}
        </InfoLine>

        {project.company ? <InfoLine icon={Building2}>{project.company}</InfoLine> : null}

        <div className="border-card-divider mt-0.5 border-t" />

        {showStatus || hasActions ? (
          <div className="flex items-center justify-between gap-2">
            {showStatus ? (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <span className="bg-chip-surface-neutral text-muted-foreground inline-flex min-w-0 items-center gap-1.5 rounded-[7px] px-2 py-0.5 text-xs">
                    <span className="bg-muted-foreground size-1.5 shrink-0 rounded-full" />
                    <span className="min-w-0 truncate">{project.plumEventStatusLabel}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Статус в PLUM</TooltipContent>
              </Tooltip>
            ) : (
              <span />
            )}
            {hasActions ? (
              <div className="flex shrink-0 items-center gap-1.5">
                {showPlumCard ? (
                  <CardIconAction
                    tooltip="Карточка в PLUM"
                    ariaLabel="Карточка в PLUM"
                    href={project.plumCardUrl}
                    external
                  >
                    <Link2 className="size-3.5" />
                  </CardIconAction>
                ) : null}
                {project.phone ? (
                  <CardIconAction
                    tooltip={project.phone}
                    ariaLabel={`Позвонить ${project.phone}`}
                    href={`tel:${project.phone}`}
                  >
                    <Phone className="size-3.5" />
                  </CardIconAction>
                ) : null}
                {telegramUrl ? (
                  <CardIconAction
                    tooltip="Контактный телеграм"
                    ariaLabel="Контактный телеграм"
                    href={telegramUrl}
                    external
                  >
                    <Send className="size-3.5" />
                  </CardIconAction>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-0.5 flex flex-col gap-1.5">
          <ManagerRow name={project.manager} role="lead" />
          {assistants.map((a) => (
            <ManagerRow key={a.id} name={a.fullName} role="assistant" />
          ))}
        </div>

        <span className="text-2xs text-muted-foreground mt-0.5">
          {formatRelativeUpdateLabel(project.updatedAt)}
        </span>
      </div>
    </Card>
  )
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}
