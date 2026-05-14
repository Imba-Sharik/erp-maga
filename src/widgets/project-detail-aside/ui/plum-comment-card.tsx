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

export function PlumCommentCard({ project }: { project: ProjectDetail }) {
  return (
    <ProjectAsideCard title="Комментарий из PLUM">
      <p className="pt-2.5 pb-3 text-[13px] text-[#454545]">
        {project.plumComment ?? '—'}
      </p>
      <KvRow label="Синхронизировано" value={formatDate(project.plumSyncedAt)} />
    </ProjectAsideCard>
  )
}
