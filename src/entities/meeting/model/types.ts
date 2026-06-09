export interface Meeting {
  id: number
  title: string
  comment: string
  /** Время в формате HH:mm */
  time: string
  /** Дата в формате yyyy-MM-dd */
  date: string
  managerId: number
}

export type MeetingsByDay = Map<string, Meeting[]>

export interface ListMeetingsParams {
  dateFrom: string
  dateTo: string
  /** null — все менеджеры */
  managerId: number | null
}
