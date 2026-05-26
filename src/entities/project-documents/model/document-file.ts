/** UI-модель загруженного закрывающего документа (метаданные с бэка). */
export interface StageDocumentFile {
  fileName: string
  fileUrl: string
  contentType?: string
  sizeBytes?: number
  uploadedAt?: string
  uploadedBy?: string
}
