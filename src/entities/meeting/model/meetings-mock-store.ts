import { addDays, format, startOfMonth } from 'date-fns'

import type { CreateMeetingInput, ListMeetingsParams, Meeting, UpdateMeetingInput } from './types'

const MOCK_DELAY_MS = 300

let meetings: Meeting[] = buildSeedMeetings()
let nextId = meetings.length + 1

type SeedMeeting = Omit<Meeting, 'id'>

function day(monthStart: Date, offset: number): string {
  return format(addDays(monthStart, offset), 'yyyy-MM-dd')
}

function buildSeedMeetings(): Meeting[] {
  const monthStart = startOfMonth(new Date())

  const seeds: SeedMeeting[] = [
    // Менеджер 1 — несколько дней, в т.ч. 2 встречи в один день
    {
      title: 'Созвон с клиентом',
      comment: 'Обсудить детали мероприятия и тайминг',
      time: '10:00',
      date: day(monthStart, 2),
      managerId: 1,
    },
    {
      title: 'Планёрка',
      comment: 'Еженедельная встреча команды',
      time: '15:30',
      date: day(monthStart, 2),
      managerId: 1,
    },
    {
      title: 'Согласование сметы',
      comment: 'Финальные правки по доп. услугам',
      time: '11:30',
      date: day(monthStart, 5),
      managerId: 1,
    },
    {
      title: 'Встреча с площадкой',
      comment: 'Уточнить рассадку и техрайдер',
      time: '14:00',
      date: day(monthStart, 9),
      managerId: 1,
    },
    {
      title: 'Бриф с заказчиком',
      comment: 'Корпоратив, 120 гостей',
      time: '09:30',
      date: day(monthStart, 12),
      managerId: 1,
    },
    {
      title: 'Созвон с бухгалтерией',
      comment: 'Закрывающие документы по прошлому событию',
      time: '16:00',
      date: day(monthStart, 12),
      managerId: 1,
    },
    {
      title: 'Презентация концепции',
      comment: 'Показ moodboard и сценария',
      time: '13:00',
      date: day(monthStart, 16),
      managerId: 1,
    },
    {
      title: 'Контрольный созвон',
      comment: 'За неделю до даты мероприятия',
      time: '10:30',
      date: day(monthStart, 20),
      managerId: 1,
    },
    {
      title: 'Встреча с кейтерингом',
      comment: 'Дегустация меню',
      time: '12:30',
      date: day(monthStart, 24),
      managerId: 1,
    },

    // Менеджер 2
    {
      title: 'Показ зала',
      comment: 'Экскурсия для заказчика',
      time: '12:00',
      date: day(monthStart, 3),
      managerId: 2,
    },
    {
      title: 'Созвон с агентством',
      comment: 'Согласовать даты и бронь',
      time: '17:00',
      date: day(monthStart, 3),
      managerId: 2,
    },
    {
      title: 'Встреча с флористом',
      comment: 'Обсудить оформление и цветовую гамму',
      time: '11:00',
      date: day(monthStart, 7),
      managerId: 2,
    },
    {
      title: 'Планёрка по свадьбе',
      comment: 'Тайминг церемонии и банкета',
      time: '15:00',
      date: day(monthStart, 11),
      managerId: 2,
    },
    {
      title: 'Созвон с DJ',
      comment: 'Плейлист и технический райдер',
      time: '18:30',
      date: day(monthStart, 14),
      managerId: 2,
    },
    {
      title: 'Встреча с родителями',
      comment: 'Детский праздник, уточнить программу',
      time: '10:00',
      date: day(monthStart, 18),
      managerId: 2,
    },
    {
      title: 'Репетиция с ведущим',
      comment: 'Прогон сценария на площадке',
      time: '14:30',
      date: day(monthStart, 22),
      managerId: 2,
    },
    {
      title: 'Финальный созвон',
      comment: 'Подтвердить рассылку гостям',
      time: '09:00',
      date: day(monthStart, 26),
      managerId: 2,
    },

    // Менеджер 3
    {
      title: 'Встреча с корпоративным клиентом',
      comment: 'Конференция на 80 человек',
      time: '10:30',
      date: day(monthStart, 1),
      managerId: 3,
    },
    {
      title: 'Согласование договора',
      comment: 'Юридические правки, подписание',
      time: '13:30',
      date: day(monthStart, 4),
      managerId: 3,
    },
    {
      title: 'Созвон с подрядчиком по свету',
      comment: 'Схема освещения зала',
      time: '16:30',
      date: day(monthStart, 8),
      managerId: 3,
    },
    {
      title: 'Планёрка',
      comment: 'Статус проектов в работе',
      time: '09:30',
      date: day(monthStart, 10),
      managerId: 3,
    },
    {
      title: 'Встреча с фотографом',
      comment: 'Зоны съёмки и тайминг',
      time: '11:30',
      date: day(monthStart, 15),
      managerId: 3,
    },
    {
      title: 'Созвон с клиентом',
      comment: 'Уточнить количество гостей',
      time: '15:30',
      date: day(monthStart, 15),
      managerId: 3,
    },
    {
      title: 'Показ лофта',
      comment: 'Первичный осмотр площадки',
      time: '12:00',
      date: day(monthStart, 19),
      managerId: 3,
    },
    {
      title: 'Встреча с декоратором',
      comment: 'Макеты зон и материалы',
      time: '14:00',
      date: day(monthStart, 23),
      managerId: 3,
    },

    // Менеджер 4 — реже, для разнообразия фильтра
    {
      title: 'Созвон с новым лидом',
      comment: 'Первичная квалификация запроса',
      time: '11:00',
      date: day(monthStart, 6),
      managerId: 4,
    },
    {
      title: 'Встреча с партнёром',
      comment: 'Обсудить совместный проект',
      time: '16:00',
      date: day(monthStart, 13),
      managerId: 4,
    },
    {
      title: 'Планёрка',
      comment: 'Итоги недели',
      time: '10:00',
      date: day(monthStart, 21),
      managerId: 4,
    },

    // «Хвосты» сетки — дни соседних месяцев
    {
      title: 'Перенос встречи',
      comment: 'Согласовать новую дату с клиентом',
      time: '14:00',
      date: day(monthStart, -2),
      managerId: 1,
    },
    {
      title: 'Созвон с поставщиком',
      comment: 'Заказ расходников на следующий месяц',
      time: '11:30',
      date: day(monthStart, -1),
      managerId: 2,
    },
    {
      title: 'План на следующий месяц',
      comment: 'Разбор входящих заявок',
      time: '09:30',
      date: day(monthStart, 28),
      managerId: 3,
    },
    {
      title: 'Встреча с администрацией зала',
      comment: 'Бронь на начало следующего месяца',
      time: '13:00',
      date: day(monthStart, 29),
      managerId: 1,
    },
  ]

  return seeds.map((seed, index) => ({
    id: `seed-${index + 1}`,
    ...seed,
  }))
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), MOCK_DELAY_MS)
  })
}

export function resetMeetingsMockStore() {
  meetings = buildSeedMeetings()
  nextId = meetings.length + 1
}

export async function listMeetings(params: ListMeetingsParams): Promise<Meeting[]> {
  const filtered = meetings.filter(
    (m) =>
      (params.managerId == null || m.managerId === params.managerId) &&
      m.date >= params.dateFrom &&
      m.date <= params.dateTo,
  )
  return delay(filtered)
}

export async function createMeeting(input: CreateMeetingInput): Promise<Meeting> {
  const meeting: Meeting = {
    id: `mock-${nextId++}`,
    ...input,
  }
  meetings = [...meetings, meeting]
  return delay(meeting)
}

export async function updateMeeting(id: string, input: UpdateMeetingInput): Promise<Meeting> {
  const index = meetings.findIndex((m) => m.id === id)
  if (index === -1) throw new Error('Встреча не найдена')
  const updated: Meeting = { ...meetings[index], ...input }
  meetings = [...meetings.slice(0, index), updated, ...meetings.slice(index + 1)]
  return delay(updated)
}

export async function deleteMeeting(id: string): Promise<void> {
  const exists = meetings.some((m) => m.id === id)
  if (!exists) throw new Error('Встреча не найдена')
  meetings = meetings.filter((m) => m.id !== id)
  return delay(undefined)
}
