import type { OutsideMagReason } from '@/entities/project'
import type { ProjectTransitionRequest } from '@/shared/api/generated/types/ProjectTransitionRequest'

export function buildOutsideMagTransitionBody(reason: OutsideMagReason): ProjectTransitionRequest {
  return {
    to_stage: 'out_of_mag_scope',
    reason,
  }
}
