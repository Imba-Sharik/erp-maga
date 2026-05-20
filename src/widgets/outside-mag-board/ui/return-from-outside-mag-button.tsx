import { TopLeftArrowIcon } from '@/shared/assets'
import { Button } from '@/shared/ui/button'

/** TODO: POST return_from_out_of_mag (выбор target_stage + comment). */
export function ReturnFromOutsideMagButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled
      title="Скоро"
      className="h-8 w-8 rounded-[8px] border-none bg-[#f8f8f8] px-2.5 text-[#ACACAC]"
    >
      <TopLeftArrowIcon className="size-4 shrink-0 [&_path]:fill-current" />
      <span className="sr-only">Вернуть из вне контура</span>
    </Button>
  )
}
