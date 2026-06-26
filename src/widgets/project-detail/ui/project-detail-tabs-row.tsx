import { ProjectTabs } from '@/features/project-tabs'
import { Button } from '@/shared/ui/button'

export function ProjectDetailTabsRow({
  showOutsideMagButton,
  onOutsideMagClick,
}: {
  showOutsideMagButton?: boolean
  onOutsideMagClick?: () => void
}) {
  return (
    <div className="@container/tabrow flex w-full flex-row items-center justify-between gap-3 md:gap-4">
      <ProjectTabs />
      {showOutsideMagButton ? (
        <Button
          type="button"
          variant="outline"
          className="border-error bg-error-surface text-error hover:bg-error-surface hover:text-error h-10 w-auto shrink-0 rounded-[10px] px-4 text-sm"
          onClick={onOutsideMagClick}
        >
          <span className="md:hidden">Вне контура</span>
          <span className="hidden md:inline">Вне контура MAG</span>
        </Button>
      ) : null}
    </div>
  )
}
