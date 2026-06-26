import { Eye } from 'lucide-react'

/**
 * Баннер режима «только просмотр»: проект ведёт другой менеджер (или он ещё в пуле),
 * текущему пользователю доступен лишь просмотр.
 */
export function ProjectReadOnlyBanner() {
  return (
    <div className="border-border bg-surface-subtle text-foreground-soft flex items-center gap-2.5 rounded-[10px] border px-4 py-3 text-sm">
      <Eye className="text-muted-foreground size-4 shrink-0" />
      <span>Проект ведёт другой менеджер — доступен только для просмотра.</span>
    </div>
  )
}
