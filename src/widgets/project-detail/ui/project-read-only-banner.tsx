import { Eye } from 'lucide-react'

/**
 * Баннер режима «только просмотр»: проект ведёт другой менеджер (или он ещё в пуле),
 * текущему пользователю доступен лишь просмотр.
 */
export function ProjectReadOnlyBanner() {
  return (
    <div className="flex items-center gap-2.5 rounded-[10px] border border-[#E9E6DD] bg-[#F9F9F9] px-4 py-3 text-sm text-[#454545]">
      <Eye className="size-4 shrink-0 text-[#ACACAC]" />
      <span>Проект ведёт другой менеджер — доступен только для просмотра.</span>
    </div>
  )
}
