import { ProjectTabs } from '@/features/project-tabs'
import { Button } from '@/shared/ui/button'

export function ProjectDetailTabsRow({
  showOutsideMagButton,
}: {
  showOutsideMagButton?: boolean
}) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <ProjectTabs />
      {showOutsideMagButton ? (
        <Button
          type="button"
          variant="outline"
          className="h-[38px] rounded-[10px] border-[#D25252] bg-[#FFF3F3] px-4 text-[13px] text-[#D25252] hover:bg-[#FFE5E5] hover:text-[#D25252]"
        >
          Вне контура MAG
        </Button>
      ) : null}
    </div>
  )
}
