import type { ProjectTabKey } from '@/features/project-tabs'
import type { ProjectDetailPresentation } from '@/shared/lib/stage-presentation'

export function presentationFromTab(tab: ProjectTabKey): ProjectDetailPresentation {
  return tab === 'economics' ? 'economics' : 'pipeline'
}
