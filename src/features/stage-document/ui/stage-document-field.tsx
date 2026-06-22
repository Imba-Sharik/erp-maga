import { useCallback, useId, useRef, useState } from 'react'

import type { StageDocumentFieldVariant } from '@/entities/project-document'
import type { StageDocumentType } from '@/entities/stage-document-file'

import type { StageDocumentInteraction } from '../lib/document-interaction'
import { FILE_ACCEPT, validateAttachment } from '../lib/file-constraints'
import { resolveStageDocumentFieldDisplay } from '../lib/resolve-document-field-display'
import { useConfirmDownload } from '../model/use-confirm-download'
import { useDownloadStageDocument } from '../model/use-download-stage-document'
import { useUploadStageDocument } from '../model/use-upload-stage-document'
import {
  AttachmentEmptyPlaceholder,
  AttachmentRejectedPlaceholder,
  AttachmentUploadButton,
} from './attachment-field-controls'
import { AttachmentFileRow } from './attachment-file-row'
import { ConfirmDownloadBinding } from './confirm-download-binding'

const REUPLOAD_SUCCESS_MESSAGE = 'Обновлённые документы направлены бухгалтеру'

export interface StageDocumentFieldProps {
  projectId: string | number
  documentType: StageDocumentType
  value: string
  variant: StageDocumentFieldVariant
  interaction: StageDocumentInteraction
  onChange?: (fileName: string) => void
  disabled?: boolean
  addButtonLabel?: string
  /** После успешной замены документа в статусе `re_requested` — зелёная подпись под полем. */
  notifyReuploadToAccountant?: boolean
}

export function StageDocumentField({
  projectId,
  documentType,
  value,
  variant,
  interaction,
  onChange,
  disabled,
  addButtonLabel = 'Добавить документ',
  notifyReuploadToAccountant = false,
}: StageDocumentFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadStageDocument()
  const download = useDownloadStageDocument()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  const isUpload = interaction === 'upload'
  const busy = upload.isPending || download.isPending
  const uploadDisabled = disabled || busy
  const downloadDisabled = busy

  const performDownload = useCallback(
    () => download.download({ projectId, documentType, fileName: value }),
    [download, projectId, documentType, value],
  )

  const { confirmOpen, requestDownload, confirmDownload, onOpenChange } = useConfirmDownload({
    fileName: value,
    downloadDisabled,
    isPending: download.isPending,
    download: performDownload,
    onDownloadError: () => {
      window.alert('Не удалось скачать файл. Попробуйте позже.')
    },
  })

  const openPicker = () => {
    if (!isUpload || uploadDisabled) return
    setUploadError(null)
    setUploadSuccess(null)
    inputRef.current?.click()
  }

  const handleFile = (file: File | undefined) => {
    if (!file || !onChange) return
    const validationError = validateAttachment(file)
    if (validationError) {
      setUploadSuccess(null)
      setUploadError(validationError)
      return
    }
    setUploadError(null)
    setUploadSuccess(null)
    const shouldNotifyReupload = notifyReuploadToAccountant
    upload.upload(
      { projectId, documentType, file },
      {
        onSuccess: () => {
          setUploadError(null)
          if (shouldNotifyReupload) {
            setUploadSuccess(REUPLOAD_SUCCESS_MESSAGE)
          }
          onChange(file.name)
        },
        onError: (message) => {
          setUploadSuccess(null)
          setUploadError(message)
        },
      },
    )
  }

  const display = resolveStageDocumentFieldDisplay(variant, value, interaction)
  const showFileRow = display === 'file-row'
  const canReplace = isUpload && Boolean(value) && !uploadDisabled
  const canDownload = Boolean(value)

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {isUpload ? (
        <input
          id={inputId}
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
      {showFileRow ? (
        <AttachmentFileRow
          value={value}
          variant={variant}
          canDownload={canDownload}
          downloadDisabled={downloadDisabled}
          onDownload={requestDownload}
          canReplace={canReplace}
          replaceDisabled={uploadDisabled}
          onReplace={openPicker}
        />
      ) : display === 'upload-button' ? (
        <AttachmentUploadButton
          disabled={uploadDisabled}
          isPending={upload.isPending}
          label={addButtonLabel}
          onClick={openPicker}
        />
      ) : display === 'placeholder-empty' ? (
        <AttachmentEmptyPlaceholder />
      ) : display === 'placeholder-rejected' ? (
        <AttachmentRejectedPlaceholder />
      ) : null}
      {uploadError ? (
        <p className="text-destructive text-sm" role="alert">
          {uploadError}
        </p>
      ) : uploadSuccess ? (
        <p className="text-sm text-[#2E7D32]" role="status">
          {uploadSuccess}
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
