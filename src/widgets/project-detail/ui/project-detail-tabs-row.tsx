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
    <div className="flex w-full flex-row items-center justify-between gap-3 md:gap-4">
      <ProjectTabs />
      {showOutsideMagButton ? (
        <Button
          type="button"
          variant="outline"
          className="h-10 w-auto shrink-0 rounded-[10px] border-[#D25252] bg-[#FFF3F3] px-4 text-sm text-[#D25252] hover:bg-[#FFE5E5] hover:text-[#D25252]"
          onClick={onOutsideMagClick}
        >
          <span className="md:hidden">Вне контура</span>
          <span className="hidden md:inline">Вне контура MAG</span>
        </Button>
      ) : null}
    </div>
  )
}
