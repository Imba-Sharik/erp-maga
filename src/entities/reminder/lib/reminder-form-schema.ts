import { z } from 'zod'

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

export const reminderFormSchema = z.object({
  title: z.string().trim().min(1, 'Обязательное поле'),
  eventType: z.string().min(1, 'Выберите тип события'),
  comment: z.string().trim(),
  date: z.string().min(1, 'Обязательное поле'),
  time: z.string().min(1, 'Обязательное поле').regex(TIME_REGEX, 'Укажите время в формате ЧЧ:ММ'),
  notifyTelegram: z.boolean(),
})

export type ReminderFormValues = z.infer<typeof reminderFormSchema>
