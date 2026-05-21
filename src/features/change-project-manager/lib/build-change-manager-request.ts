/** TODO: уточнить контракт PATCH /projects/{id}/ при появлении в OpenAPI. */
export function buildChangeManagerRequest(managerName: string) {
  return { mag_manager: managerName }
}
