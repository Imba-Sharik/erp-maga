import { Badge } from '@/shared/ui/badge'
import { KvRow, ProjectAsideCard, type ProjectDetail } from '@/entities/project'

const DATE_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function formatDate(value: string | undefined) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return DATE_FORMAT.format(d)
}

export function PlumDataCard({ project }: { project: ProjectDetail }) {
  return (
    <ProjectAsideCard
      title="Данные из PLUM"
      badge={
        <Badge variant="secondary" className="text-[10px] text-[#B0B0B0]">
          Read-only
        </Badge>
      }
      subline={`Источник: Plum · ID ${project.plumId}`}
    >
      <KvRow
        label="Статус в PLUM"
        value={
          <span className="text-[#3AA56B]">
            {project.plumStatus === 'confirmed' ? 'Подтверждено' : 'Ожидание'}
          </span>
        }
      />
      <KvRow label="Тип мероприятия" value={project.type} />
      <KvRow label="Дата" value={formatDate(project.date)} />
      <KvRow label="Лофт" value={project.loft} />
      <KvRow label="Зал" value={project.hall} />
      <KvRow label="Город" value={project.city} />
    </ProjectAsideCard>
  )
}
