/** Параметры сужения справочника менеджеров под зал/проект (GET /api/v1/managers/). */
export type ManagersDirectoryFilter =
  | { projectId: number; hallId?: never; loftId?: never }
  | { hallId: number; loftId?: number; projectId?: never }
