/**
 * Тело `PATCH /api/v1/projects/{id}` для claim проекта из пула: менеджер берёт
 * проект на себя, отправляя свой `mag_manager_id`. Бэк проверит привязку к залу
 * и что проект свободен.
 *
 * `currentUserId` приходит из `useCurrentUser().id` (строка). До загрузки `/users/me/`
 * там может быть синтетический `stub-<role>` — `Number(...)` даст `NaN`, и мы бросаем,
 * чтобы не уйти на бэк с битым телом.
 */
export function buildClaimRequest(currentUserId: string): { mag_manager_id: number } {
  const mag_manager_id = Number(currentUserId)
  if (!Number.isFinite(mag_manager_id) || mag_manager_id <= 0) {
    throw new Error('Invalid current user id')
  }
  return { mag_manager_id }
}
