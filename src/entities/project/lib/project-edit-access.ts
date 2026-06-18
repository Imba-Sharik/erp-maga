import type { Project } from '../model/types'

/**
 * Проект открыт «только для просмотра»: пользователь видит его, но не ведёт —
 * проект из пула либо взят другим менеджером.
 *
 * Источник — бэк-флаги `is_read_only`/`can_edit`. Для владельца и руководителя бэк
 * присылает `canEdit=true`/`isReadOnly=false`, поэтому ролевую логику тут дублировать
 * не нужно — она уже учтена на сервере.
 */
export function resolveProjectReadOnly(project: Pick<Project, 'isReadOnly' | 'canEdit'>): boolean {
  return project.isReadOnly || !project.canEdit
}
