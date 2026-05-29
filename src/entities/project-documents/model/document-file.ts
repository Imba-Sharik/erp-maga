/** UI-модель загруженного закрывающего документа (метаданные с бэка). */
export interface StageDocumentFile {
  fileName: string
  fileUrl: string
  contentType?: string
  sizeBytes?: number
  uploadedAt?: string
  uploadedBy?: string
  /** Время повторной загрузки файла менеджером после `re_requested` (с бэка). */
  reuploadedAt?: string
}
