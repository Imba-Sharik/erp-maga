import { useMutation } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import client from '@/shared/api/client'

import { downloadBlob } from '../lib/download-blob'

interface DownloadCalculationFileArgs {
  projectId: string | number
  fileName?: string
}

async function fetchCalculationFile({
  projectId,
  fileName,
}: DownloadCalculationFileArgs): Promise<void> {
  const id = Number(projectId)
  const response = await client<Blob>({
    method: 'GET',
    url: `/api/v1/projects/${id}/calculation/file/`,
    responseType: 'blob',
  })
  const blob = response.data
  const name = fileName?.trim() || 'calculation'
  downloadBlob(new File([blob], name), name)
}

/** Скачивание файла сметы через `GET /projects/:id/calculation/file/`. */
export function useDownloadCalculationFile() {
  const mutation = useMutation({ mutationFn: fetchCalculationFile })

  const download = useCallback(
    (args: DownloadCalculationFileArgs) => mutation.mutateAsync(args),
    [mutation],
  )

  return useMemo(
    () => ({
      download,
      isPending: mutation.isPending,
      isError: mutation.isError,
      error: mutation.error,
      reset: mutation.reset,
    }),
    [download, mutation.isPending, mutation.isError, mutation.error, mutation.reset],
  )
}
