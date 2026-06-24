import { ChevronDown } from 'lucide-react'

import { formatNotificationDayHeader, NotificationItem } from '@/entities/notification'
import type { NotificationView } from '@/entities/notification'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'

interface NotificationDaySectionProps {
  notifications: NotificationView[]
  onRead?: (id: number) => void
}

/**
 * Группа уведомлений за один день. Крайнее (самое свежее) уведомление видно всегда,
 * остальные сворачиваются в аккордион стрелкой в заголовке (ERP-192).
 */
export function NotificationDaySection({ notifications, onRead }: NotificationDaySectionProps) {
  const [latest, ...rest] = notifications
  const collapsible = rest.length > 0

  return (
    <Collapsible defaultOpen asChild>
      <section className="flex flex-col gap-2">
        <div className="px-1">
          {collapsible ? (
            <CollapsibleTrigger
              aria-label={`Свернуть уведомления (ещё ${rest.length})`}
              className="group focus-visible:ring-ring/40 flex items-center gap-1.5 rounded-md py-1 text-[#ACACAC] transition-colors hover:text-[#6B6B6B] focus-visible:ring-2 focus-visible:outline-none"
            >
              <h2 className="text-xs font-semibold tracking-wide uppercase">
                {formatNotificationDayHeader(latest.createdAt)}
              </h2>
              <ChevronDown className="size-4 transition-transform group-data-[state=closed]:-rotate-90" />
            </CollapsibleTrigger>
          ) : (
            <h2 className="py-1 text-xs font-semibold tracking-wide text-[#ACACAC] uppercase">
              {formatNotificationDayHeader(latest.createdAt)}
            </h2>
          )}
        </div>

        <div className="overflow-hidden rounded-[14px] border border-[#E9E6DD] bg-white">
          <NotificationItem notification={latest} onRead={onRead} showDateLabel={false} />
          {collapsible && (
            <CollapsibleContent>
              <div className="divide-y divide-[#F0F0F0] border-t border-[#F0F0F0]">
                {rest.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onRead={onRead}
                    showDateLabel={false}
                  />
                ))}
              </div>
            </CollapsibleContent>
          )}
        </div>
      </section>
    </Collapsible>
  )
}
