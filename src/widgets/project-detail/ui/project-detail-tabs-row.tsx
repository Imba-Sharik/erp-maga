import { ProjectTabs } from '@/features/project-tabs'

export function ProjectDetailTabsRow({ showRequiredHint }: { showRequiredHint?: boolean }) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <ProjectTabs />
      {showRequiredHint ? (
        <p className="text-destructive text-xs font-medium">
          *Заполните все обязательные поля
        </p>
      ) : null}
    </div>
  )
}
