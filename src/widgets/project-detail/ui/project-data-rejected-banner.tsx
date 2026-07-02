import { CircleAlert } from 'lucide-react'

/**
 * Баннер системной паузы «Данные не приняты» (ERP-221): руководитель не принял
 * данные на этапе «Данные подтверждены». Причину система не хранит — детали
 * менеджер и руководитель обсуждают вне ERP, поэтому баннер зовёт связаться.
 */
export function ProjectDataRejectedBanner() {
  return (
    <div className="border-error-border bg-error-surface text-error flex items-center gap-2.5 rounded-[10px] border px-4 py-3 text-sm">
      <CircleAlert className="size-4 shrink-0" />
      <span>Данные проекта не приняты — свяжитесь с руководителем.</span>
    </div>
  )
}
