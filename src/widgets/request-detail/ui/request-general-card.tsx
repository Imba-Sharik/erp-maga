import { format, parseISO } from 'date-fns'

import type { ProjectDetail } from '@/entities/project'

function formatDate(iso: string): string {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), 'dd.MM.yyyy')
  } catch {
    return iso
  }
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-foreground truncate text-sm">{value || '—'}</span>
    </div>
  )
}

/** Общая информация о проекте для ЛК бухгалтера — 7 полей запроса. */
export function RequestGeneralCard({ project }: { project: ProjectDetail }) {
  return (
    <div className="border-border-strong bg-card @container w-full rounded-[15px] border p-6">
      <h1 className="font-heading text-foreground font-bold">{project.title || 'Проект'}</h1>
      <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 @[640px]:grid-cols-3">
        <InfoField label="LOFT" value={project.loft} />
        <InfoField label="Зал" value={project.hall} />
        <InfoField label="Ответственный менеджер" value={project.manager} />
        <InfoField label="Дата мероприятия" value={formatDate(project.date)} />
        <InfoField label="Компания" value={project.company} />
        <InfoField label="Появление в системе" value={formatDate(project.createdAt)} />
      </div>
    </div>
  )
}
