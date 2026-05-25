import { create } from 'zustand'

import { documentFileKey, type StageDocumentType } from './types'

interface StageDocumentFilesState {
  files: Record<string, File>
  setFile: (projectId: string | number, documentType: StageDocumentType, file: File) => void
  clearFile: (projectId: string | number, documentType: StageDocumentType) => void
}

export const useStageDocumentFilesStore = create<StageDocumentFilesState>()((set) => ({
  files: {},
  setFile: (projectId, documentType, file) =>
    set((s) => ({
      files: { ...s.files, [documentFileKey(projectId, documentType)]: file },
    })),
  clearFile: (projectId, documentType) =>
    set((s) => {
      const key = documentFileKey(projectId, documentType)
      if (!(key in s.files)) return s
      const next = { ...s.files }
      delete next[key]
      return { files: next }
    }),
}))

export const stageDocumentFilesActions = {
  get: (projectId: string | number, documentType: StageDocumentType): File | undefined =>
    useStageDocumentFilesStore.getState().files[documentFileKey(projectId, documentType)],
  set: (projectId: string | number, documentType: StageDocumentType, file: File): void =>
    useStageDocumentFilesStore.getState().setFile(projectId, documentType, file),
  clear: (projectId: string | number, documentType: StageDocumentType): void =>
    useStageDocumentFilesStore.getState().clearFile(projectId, documentType),
}
