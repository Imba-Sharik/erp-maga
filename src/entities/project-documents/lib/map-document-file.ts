import type { ProjectDocumentFile } from '@/shared/api/generated/types/ProjectDocumentFile'

import type { StageDocumentFile } from '../model/document-file'

/** Backend `ProjectDocumentFile` → UI `StageDocumentFile`; `undefined`, если нет имени или URL. */
export function mapBackendDocumentFile(
  file: ProjectDocumentFile | null | undefined,
): StageDocumentFile | undefined {
  if (!file?.file_name || !file.file_url) return undefined
  return {
    fileName: file.file_name,
    fileUrl: file.file_url,
    ...(file.content_type ? { contentType: file.content_type } : {}),
    ...(typeof file.size === 'number' ? { sizeBytes: file.size } : {}),
    ...(file.uploaded_at ? { uploadedAt: file.uploaded_at } : {}),
    ...(file.uploaded_by?.full_name ? { uploadedBy: file.uploaded_by.full_name } : {}),
  }
}
