export { useOptimisticKanbanStageUpdate } from './model/use-optimistic-kanban-stage-update'
export type { OptimisticKanbanStageMoveInput } from './model/use-optimistic-kanban-stage-update'
export {
  moveProjectInKanbanCache,
  snapshotKanbanCaches,
  restoreKanbanCaches,
  prependProjectToMatchingCaches,
} from '@/widgets/projects-board/lib/kanban-projects-cache'
export type {
  KanbanCacheSnapshot,
  MoveProjectInKanbanCacheInput,
} from '@/widgets/projects-board/lib/kanban-projects-cache'
