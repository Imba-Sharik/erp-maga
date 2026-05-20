import { TopLeftArrowIcon } from '@/shared/assets'
import { Button } from '@/shared/ui/button'

export function ReturnFromOutsideMagButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-disabled
      title="Вернуть из «Вне контура»"
      className="h-8 w-8 cursor-pointer rounded-[8px] border-none bg-[#f8f8f8] px-2.5 text-[#ACACAC] hover:bg-[#e8e8e8] hover:text-[#454545]"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <TopLeftArrowIcon className="size-4 shrink-0 [&_path]:fill-current" />
      <span className="sr-only">Вернуть из вне контура</span>
    </Button>
  )
}
