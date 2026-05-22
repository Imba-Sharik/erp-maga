export { useOptimisticKanbanStageUpdate } from './model/use-optimistic-kanban-stage-update'
export type { OptimisticKanbanStageMoveInput } from './model/use-optimistic-kanban-stage-update'
export {
  moveProjectInKanbanCache,
  snapshotKanbanCaches,
  restoreKanbanCaches,
  prependProjectToMatchingCaches,
} from '@/shared/api/projects-kanban'
export type {
  KanbanCacheSnapshot,
  MoveProjectInKanbanCacheInput,
} from '@/shared/api/projects-kanban'
