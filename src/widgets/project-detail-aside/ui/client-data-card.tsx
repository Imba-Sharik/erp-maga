import { Badge } from '@/shared/ui/badge'
import { KvRow, ProjectAsideCard, type ProjectDetail } from '@/entities/project'

export function ClientDataCard({ project }: { project: ProjectDetail }) {
  return (
    <ProjectAsideCard
      title="Данные Клиента"
      badge={
        <Badge variant="success" className="text-[10px]">
          {project.clientStatus === 'confirmed' ? 'Подтверждено' : 'Ожидание'}
        </Badge>
      }
    >
      <KvRow label="Компания" value={project.clientCompany} />
      <KvRow label="Контактное лицо" value={project.manager} />
      <KvRow label="Телефон" value={project.phone} />
      <KvRow label="Email" value={project.email} />
    </ProjectAsideCard>
  )
}
