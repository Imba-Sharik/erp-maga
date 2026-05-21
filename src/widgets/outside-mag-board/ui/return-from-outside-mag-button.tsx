import { TopLeftArrowIcon } from '@/shared/assets'
import { TableIconActionButton } from '@/shared/ui/grid-table'

/** TODO: POST return_from_out_of_mag (выбор target_stage + comment). */
export function ReturnFromOutsideMagButton() {
  return (
    <TableIconActionButton
      icon={<TopLeftArrowIcon className="size-4 shrink-0 [&_path]:fill-current" />}
      aria-label="Вернуть из вне контура"
      disabled
      title="Скоро"
    />
  )
}
