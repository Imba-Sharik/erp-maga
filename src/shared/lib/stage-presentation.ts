export type ProjectDetailPresentation = 'pipeline' | 'economics'

export interface StagePresentationConfig {
  readOnly: boolean
  showStageHeader: boolean
  stageCollapsible: boolean
  showAdvanceButton: boolean
  showFunnelHeaders: boolean
}

export const STAGE_PRESENTATION: Record<ProjectDetailPresentation, StagePresentationConfig> = {
  pipeline: {
    readOnly: false,
    showStageHeader: true,
    stageCollapsible: true,
    showAdvanceButton: true,
    showFunnelHeaders: true,
  },
  economics: {
    readOnly: true,
    showStageHeader: false,
    stageCollapsible: false,
    showAdvanceButton: false,
    showFunnelHeaders: true,
  },
}
