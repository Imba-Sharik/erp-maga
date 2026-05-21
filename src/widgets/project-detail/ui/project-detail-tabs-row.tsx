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
    <div className="flex w-full items-center justify-between gap-4">
      <ProjectTabs />
      {showOutsideMagButton ? (
        <Button
          type="button"
          variant="outline"
          className="h-[38px] rounded-[10px] border-[#D25252] bg-[#FFF3F3] px-4 text-sm text-[#D25252] hover:bg-[#FFE5E5] hover:text-[#D25252]"
          onClick={onOutsideMagClick}
        >
          Вне контура MAG
        </Button>
      ) : null}
    </div>
  )
}
