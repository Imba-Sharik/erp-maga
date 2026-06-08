export interface Meeting {
  id: string
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

export interface CreateMeetingInput {
  title: string
  comment: string
  time: string
  date: string
  managerId: number
}

export interface UpdateMeetingInput {
  title: string
  comment: string
  time: string
}
