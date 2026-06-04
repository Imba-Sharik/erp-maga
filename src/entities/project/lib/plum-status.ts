import type { Project } from '../model/types'

type PlumStatusFields = Pick<Project, 'isFromPlum' | 'plumEventStatusLabel'>

export function shouldShowPlumStatusLine(project: PlumStatusFields): boolean {
  return project.isFromPlum && Boolean(project.plumEventStatusLabel?.trim())
}

export function formatPlumStatusTableValue(project: PlumStatusFields): string {
  const label = project.plumEventStatusLabel?.trim()
  if (!project.isFromPlum || !label) return '—'
  return label
}
