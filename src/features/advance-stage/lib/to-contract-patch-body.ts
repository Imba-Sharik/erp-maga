import type { StageFormData } from '@/entities/project'
import type { PatchedContractBlockUpdateRequest } from '@/shared/api/generated/types/PatchedContractBlockUpdateRequest'
import type { ContractBlockSchema } from '@/shared/api/generated/types/ContractBlockSchema'

/** UI → PATCH /projects/{id}/contract/ */
export function buildContractPatchBody(
  values: Partial<StageFormData>,
): PatchedContractBlockUpdateRequest {
  const body: PatchedContractBlockUpdateRequest = {}

  if (values.contractType) {
    body.contract_type = values.contractType
  }
  if (values.contractNumber !== undefined) {
    body.contract_number = values.contractNumber
  }
  if (values.contractDate !== undefined) {
    body.contract_date = values.contractDate || null
  }
  if (values.legalEntity !== undefined) {
    body.legal_entity = values.legalEntity
  }
  if (values.contractComment !== undefined) {
    body.contract_comment = values.contractComment
  }

  return body
}

/** Ответ PATCH contract → поля этапа в UI. */
export function mapContractBlockToFormData(block: ContractBlockSchema): Partial<StageFormData> {
  const values: Partial<StageFormData> = {}

  if (block.contract_type != null) {
    values.contractType = block.contract_type
  }
  if (block.contract_number !== undefined) {
    values.contractNumber = block.contract_number
  }
  if (block.contract_date != null) {
    values.contractDate = block.contract_date
  } else if (block.contract_date === null) {
    values.contractDate = undefined
  }
  if (block.legal_entity !== undefined) {
    values.legalEntity = block.legal_entity
  }
  const comment = block.comment
  if (comment !== undefined) {
    values.contractComment = comment
  }

  return values
}
