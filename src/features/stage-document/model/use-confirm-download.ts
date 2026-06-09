import { useCallback, useState } from 'react'

export interface UseConfirmDownloadOptions {
  fileName: string
  downloadDisabled: boolean
  isPending: boolean
  download: () => Promise<unknown>
  onDownloadError?: () => void
}

export function useConfirmDownload({
  fileName,
  downloadDisabled,
  isPending,
  download,
  onDownloadError,
}: UseConfirmDownloadOptions) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  const requestDownload = useCallback(() => {
    if (!fileName || downloadDisabled) return
    setConfirmOpen(true)
  }, [fileName, downloadDisabled])

  const confirmDownload = useCallback(() => {
    download()
      .then(() => {
        setConfirmOpen(false)
      })
      .catch(() => {
        setConfirmOpen(false)
        onDownloadError?.()
      })
  }, [download, onDownloadError])

  const onOpenChange = useCallback(
    (next: boolean) => {
      if (!isPending) setConfirmOpen(next)
    },
    [isPending],
  )

  return {
    confirmOpen,
    requestDownload,
    confirmDownload,
    onOpenChange,
  }
}
