import { ExternalLinkIcon, RefreshCwIcon, SendIcon } from 'lucide-react'
import { useState } from 'react'

import { formatDateTime } from '@/shared/lib/date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

import { useRequestTelegramLink } from '../model/use-request-telegram-link'
import { useTelegramAccountStatus } from '../model/use-telegram-account-status'
import { ConfirmUnlinkTelegramDialog } from './confirm-unlink-telegram-dialog'

export function TelegramLinkSection() {
  const { isLoading, isFetching, isLinked, username, refetch } = useTelegramAccountStatus()
  const { requestLink, isPending, linkData, isError, errorMessage, reset } =
    useRequestTelegramLink()
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false)

  const handleRequestLink = async () => {
    reset()
    try {
      await requestLink()
    } catch {
      // Ошибка уже в errorMessage через mutation state.
    }
  }

  return (
    <>
      <section className="border-border bg-card overflow-hidden rounded-[14px] border">
        <div className="border-surface-divider flex items-start gap-4 border-b px-5 py-4">
          <div className="bg-info-surface flex size-10 shrink-0 items-center justify-center rounded-full">
            <SendIcon className="text-info size-5" aria-hidden />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-foreground text-base font-semibold">Telegram</h2>
              {!isLoading && (
                <Badge variant={isLinked ? 'success' : 'counter'} className="text-2xs">
                  {isLinked ? 'Привязан' : 'Не привязан'}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              Получайте уведомления по проектам в Telegram-боте MAG. Привязка выполняется через
              официального бота — пароль вводить не нужно.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-5 py-4">
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Загрузка статуса…</p>
          ) : isLinked ? (
            <>
              <dl className="grid gap-1 text-sm">
                <dt className="text-muted-foreground">Аккаунт</dt>
                <dd className="text-foreground font-medium">{username ?? 'Telegram подключён'}</dd>
              </dl>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground rounded-[10px]"
                  onClick={() => setUnlinkDialogOpen(true)}
                >
                  Отвязать
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-info rounded-[10px]"
                  onClick={() => void refetch()}
                  disabled={isFetching}
                >
                  <RefreshCwIcon className={isFetching ? 'animate-spin' : undefined} />
                  Обновить статус
                </Button>
              </div>
            </>
          ) : (
            <>
              <ol className="text-foreground list-decimal space-y-1.5 pl-4 text-sm">
                <li>Нажмите «Привязать Telegram» — откроется бот в новой вкладке.</li>
                <li>В боте нажмите «Start» или отправьте команду, которую предложит бот.</li>
                <li>Вернитесь сюда: статус обновится автоматически при возврате на вкладку.</li>
              </ol>

              {linkData && (
                <p className="border-info-border bg-info-surface/60 text-info rounded-[10px] border px-3 py-2 text-sm">
                  Ссылка действует до {formatDateTime(linkData.expires_at)}. Если не успели —
                  запросите новую.
                </p>
              )}

              {isError && errorMessage && (
                <p className="text-error text-sm" role="alert">
                  {errorMessage}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="rounded-[10px]"
                  onClick={() => void handleRequestLink()}
                  disabled={isPending}
                >
                  <ExternalLinkIcon />
                  {isPending ? 'Получение ссылки…' : 'Привязать Telegram'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-info rounded-[10px]"
                  onClick={() => void refetch()}
                  disabled={isFetching}
                >
                  <RefreshCwIcon className={isFetching ? 'animate-spin' : undefined} />
                  Обновить статус
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      <ConfirmUnlinkTelegramDialog
        open={unlinkDialogOpen}
        onOpenChange={setUnlinkDialogOpen}
        username={username}
      />
    </>
  )
}
