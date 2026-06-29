export interface MeetingHall {
  hallId: number
  hallName: string
  loftId: number | null
  loftName: string
}

export interface Meeting {
  id: number
  title: string
  /** Тип события (ERP-215): meeting/installation/event/day_off/vacation/out_of_office; '' если не задан. */
  eventType: string
  comment: string
  /** Время в формате HH:mm */
  time: string
  /** Дата в формате yyyy-MM-dd */
  date: string
  managerId: number
  halls: MeetingHall[]
}

export type MeetingsByDay = Map<string, Meeting[]>

export interface ListMeetingsParams {
  dateFrom: string
  dateTo: string
  /**
   * Фильтр по отв. менеджерам (бэк: `?manager=1,2`). Пустой массив — фильтр не
   * передаётся: руководитель/админ видят всех, менеджер MAG — только свои.
   * Чтобы менеджер увидел чужие встречи, id нужно передать явно (ERP-216).
   */
  managerIds: number[]
}
