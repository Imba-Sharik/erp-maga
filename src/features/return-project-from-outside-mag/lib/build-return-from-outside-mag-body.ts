import { preprojectStageToApi, type PreprojectStage } from '@/entities/project'
import type { ProjectTransitionRequest } from '@/shared/api/generated/types/ProjectTransitionRequest'

export function buildReturnFromOutsideMagBody(
  targetStage: PreprojectStage,
): ProjectTransitionRequest {
  return {
    to_stage: 'return_from_out_of_mag',
    target_stage: preprojectStageToApi(targetStage),
  }
}
