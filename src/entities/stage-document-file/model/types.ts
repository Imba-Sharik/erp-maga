export type StageDocumentType = 'project_closing' | 'subrent_closing' | 'staff_receipts'

export function documentFileKey(
  projectId: string | number,
  documentType: StageDocumentType,
): string {
  return `${projectId}:${documentType}`
}
