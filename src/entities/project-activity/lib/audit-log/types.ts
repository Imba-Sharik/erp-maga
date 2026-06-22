import type { StageDocumentType } from '@/entities/stage-document-file'

/** Контекст для форматирования значений audit-log (ID → имя и т.п.). */
export interface AuditLogFormatContext {
  managerNameById?: ReadonlyMap<number, string>
}

export type ParsedAuditField =
  | { kind: 'stage' }
  | { kind: 'document_status'; documentType: StageDocumentType }
  | { kind: 'mag_manager' }
  | { kind: 'generic'; name: string }
