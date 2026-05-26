export {
  STAGE_DOCUMENTS,
  STAGE_DOCUMENT_SLOTS,
  DOCUMENT_STATUS_OPTIONS,
  DOCUMENT_STATUS_LABELS,
  DOC_PAIR_BY_STATUS_FIELD,
  FILE_NAME_TO_STATUS_FIELD,
  FIELD_TO_DOCUMENT_TYPE,
  CONFIRMED_AT_TO_STATUS_FIELD,
  STATUS_CONFIRM_META_BY_STATUS,
  documentTypeFromFieldName,
} from './lib/stage-document-registry'
export type {
  StageDocumentDefinition,
  StageDocumentSlot,
  StageDocumentStatusField,
  StageDocumentFileNameField,
} from './lib/stage-document-registry'
export type { StageDocumentFieldVariant } from './lib/stage-document-variant'
export { getStageDocumentFieldVariant } from './lib/stage-document-variant'
export { resolveStageDocuments } from './lib/resolve-stage-documents'
export type {
  ProjectStageDocumentItem,
  ResolveStageDocumentsOptions,
} from './lib/resolve-stage-documents'
export { resolveStageDocumentSource } from './lib/resolve-document-source'
export type { StageDocumentSource } from './lib/resolve-document-source'
export {
  hasReRequestedStatus,
  isDocumentsStageSettled,
  isDocumentsStageSkipped,
  needsAccountantDocumentsAttention,
} from './lib/documents-workflow'
