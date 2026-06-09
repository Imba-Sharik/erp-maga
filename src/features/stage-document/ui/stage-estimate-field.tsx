import { useCallback, useRef, useState } from 'react'

import { FILE_ACCEPT, validateAttachment } from '../lib/file-constraints'
import { useConfirmDownload } from '../model/use-confirm-download'
import { useDownloadCalculationFile } from '../model/use-download-calculation-file'
import { useUploadCalculationFile } from '../model/use-upload-calculation-file'
import { AttachmentEmptyPlaceholder, AttachmentUploadButton } from './attachment-field-controls'
import { AttachmentFileRow } from './attachment-file-row'
import { ConfirmDownloadBinding } from './confirm-download-binding'

/**
 * Поле сметы на этапе «Расчёт подготовлен».
 *
 * Файл загружается/заменяется через `POST /projects/:id/calculation/file/`
 * (хук {@link useUploadCalculationFile}); скачивается через
 * `GET /projects/:id/calculation/file/`. После успешной загрузки `onChange`
 * получает `calculation_file_name` с бэка — он же гейтит обязательность этапа.
 */
export interface StageEstimateFieldProps {
  projectId: string | number
  value: string
  onChange?: (fileName: string) => void
  disabled?: boolean
  addButtonLabel?: string
  /** `upload` — менеджер прикрепляет; `download` — readonly-вид в пройденном этапе. */
  interaction: 'upload' | 'download'
}

export function StageEstimateField({
  projectId,
  value,
  onChange,
  disabled,
  addButtonLabel = 'Добавить смету',
  interaction,
}: StageEstimateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const upload = useUploadCalculationFile()
  const download = useDownloadCalculationFile()

  const isUpload = interaction === 'upload'
  const busy = upload.isPending || download.isPending
  const uploadDisabled = disabled || busy
  const downloadDisabled = busy

  const performDownload = useCallback(
    () => download.download({ projectId, fileName: value }),
    [download, projectId, value],
  )

  const { confirmOpen, requestDownload, confirmDownload, onOpenChange } = useConfirmDownload({
    fileName: value,
    downloadDisabled,
    isPending: download.isPending,
    download: performDownload,
    onDownloadError: () => {
      setError('Не удалось скачать файл. Попробуйте позже.')
    },
  })

  const openPicker = () => {
    if (!isUpload || uploadDisabled) return
    setError(null)
    inputRef.current?.click()
  }

  const handleFile = (file: File | undefined) => {
    if (!file || !onChange) return
    const validationError = validateAttachment(file)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    upload.upload(
      { projectId, file },
      {
        onSuccess: (fileName) => onChange(fileName),
        onError: (message) => setError(message),
      },
    )
  }

  const canReplace = isUpload && Boolean(value) && !uploadDisabled
  const canDownload = Boolean(value)

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {isUpload ? (
        <input
          ref={inputRef}
          type="file"
          accept={FILE_ACCEPT}
          className="sr-only"
          disabled={uploadDisabled}
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      ) : null}
      {value ? (
        <AttachmentFileRow
          value={value}
          variant="uploaded"
          canDownload={canDownload}
          downloadDisabled={downloadDisabled}
          onDownload={requestDownload}
          canReplace={canReplace}
          replaceDisabled={uploadDisabled}
          onReplace={openPicker}
        />
      ) : isUpload ? (
        <AttachmentUploadButton
          disabled={uploadDisabled}
          isPending={upload.isPending}
          label={addButtonLabel}
          onClick={openPicker}
        />
      ) : (
        <AttachmentEmptyPlaceholder />
      )}
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      <ConfirmDownloadBinding
        fileName={value}
        confirmOpen={confirmOpen}
        onOpenChange={onOpenChange}
        onConfirm={confirmDownload}
        isPending={download.isPending}
      />
    </div>
  )
}
