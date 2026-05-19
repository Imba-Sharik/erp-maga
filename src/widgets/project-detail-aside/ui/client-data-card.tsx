import { Badge } from '@/shared/ui/badge'
import {
  buildTelegramPhoneUrl,
  KvRow,
  ProjectAsideCard,
  type ProjectDetail,
} from '@/entities/project'

export function ClientDataCard({ project }: { project: ProjectDetail }) {
  const telegramUrl = buildTelegramPhoneUrl(project.phone)

  return (
    <ProjectAsideCard
      title="Данные Клиента"
      badge={
        <Badge variant="success" className="text-2xs">
          {project.clientStatus === 'confirmed' ? 'Подтверждено' : 'Ожидание'}
        </Badge>
      }
    >
      <KvRow label="Компания" value={project.clientCompany} />
      <KvRow label="Контактное лицо" value={project.manager} />
      <KvRow label="Телефон" value={project.phone} />
      {telegramUrl && (
        <KvRow
          label="Ссылка на телеграм"
          value={
            <a
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="text-funnel-preproject underline-offset-2 hover:underline"
            >
              Перейти
            </a>
          }
        />
      )}
    </ProjectAsideCard>
  )
}
