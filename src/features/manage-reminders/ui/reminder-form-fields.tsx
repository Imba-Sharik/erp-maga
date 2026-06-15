import { useWatch, type Control } from 'react-hook-form'
import { ExternalLink } from 'lucide-react'

import type { ReminderFormValues } from '@/entities/reminder'
import { useRequestTelegramLink, useTelegramAccountStatus } from '@/features/link-telegram'
import { Button } from '@/shared/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { RequiredLabel } from '@/shared/ui/required-label'
import { Textarea } from '@/shared/ui/textarea'
import { DateField } from '@/shared/ui/date-field'
import { TimeField } from '@/shared/ui/time-field'
import { ToggleSwitch } from '@/shared/ui/toggle-switch'

export function ReminderFormFields({ control }: { control: Control<ReminderFormValues> }) {
  const telegram = useTelegramAccountStatus()
  const { requestLink, isPending: linkPending } = useRequestTelegramLink()
  const notifyTelegram = useWatch({ control, name: 'notifyTelegram' })

  return (
    <>
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <RequiredLabel label="Заголовок" required />
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                className="h-10 rounded-[10px] border-[#B1B1B1]"
                placeholder="Введите заголовок"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="comment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Комментарий</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                className="min-h-20 rounded-[10px] border-[#B1B1B1]"
                placeholder="Введите комментарий"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabel label="Дата напоминания" required />
              </FormLabel>
              <FormControl>
                <DateField value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabel label="Время напоминания" required />
              </FormLabel>
              <FormControl>
                <TimeField value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="notifyTelegram"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2">
            <ToggleSwitch
              label="Напомнить в Telegram"
              checked={field.value}
              onChange={field.onChange}
            />
            <p className="text-xs text-[#ACACAC]">
              Уведомление в любом случае придёт в ЕРП. Telegram — дополнительно.
            </p>
          </FormItem>
        )}
      />

      {notifyTelegram && !telegram.isLoading && !telegram.isLinked ? (
        <div className="flex flex-col gap-2 rounded-[10px] border border-[#E4D3B7] bg-[#FBF4E8] px-3 py-2.5">
          <p className="text-sm text-[#AA8540]">
            Telegram-бот не привязан. Привяжите его или выключите тумблер — иначе напоминание не
            сохранится.
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-9 w-fit rounded-[10px] border-[#E4D3B7] bg-white text-[#AA8540] hover:bg-[#FBF4E8]"
            disabled={linkPending}
            onClick={() => void requestLink()}
          >
            <ExternalLink className="size-4" />
            {linkPending ? 'Получение ссылки…' : 'Привязать Telegram'}
          </Button>
        </div>
      ) : null}
    </>
  )
}
