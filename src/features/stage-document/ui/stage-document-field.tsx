import { useId, useRef, useState } from 'react'

import type { StageDocumentFieldVariant } from '@/entities/project-documents'
import type { StageDocumentType } from '@/entities/stage-document-files'
import { CycleIcon, DocumentIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

import type { StageDocumentInteraction } from '../lib/document-interaction'
import { useDownloadStageDocument } from '../model/use-download-stage-document'
import { useUploadStageDocument } from '../model/use-upload-stage-document'
import { ConfirmDownloadDialog } from './confirm-download-dialog'

const FILE_ACCEPT =
  'image/*,.pdf,.doc,.docx,.xls,.xlsx,.odt,.ods,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024

const BLOCKED_MIME_PREFIXES = ['video/', 'audio/'] as const
const BLOCKED_MIME_TYPES = new Set(['image/gif'])

function isAllowedFile(file: File): boolean {
  const mime = file.type.toLowerCase()
  if (BLOCKED_MIME_TYPES.has(mime)) return false
  if (BLOCKED_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix))) return false
  if (file.name.toLowerCase().endsWith('.gif')) return false
  return true
}

export interface StageDocumentFieldProps {
  projectId: string | number
  documentType: StageDocumentType
  value: string
  variant: StageDocumentFieldVariant
  interaction: StageDocumentInteraction
  onChange?: (fileName: string) => void
  disabled?: boolean
  addButtonLabel?: string
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
}: StageDocumentFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadStageDocument()
  const download = useDownloadStageDocument()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const isUpload = interaction === 'upload'
  const busy = upload.isPending || download.isPending
  const uploadDisabled = disabled || busy
  const downloadDisabled = busy

  const openPicker = () => {
    if (!isUpload || uploadDisabled || variant === 'confirmed') return
    setUploadError(null)
    inputRef.current?.click()
  }

  const requestDownload = () => {
    if (!value || downloadDisabled) return
    setConfirmOpen(true)
  }

  const confirmDownload = () => {
    download
      .download({ projectId, documentType, fileName: value })
      .then(() => {
        setConfirmOpen(false)
      })
      .catch(() => {
        setConfirmOpen(false)
        window.alert('Не удалось скачать файл. Попробуйте позже.')
      })
  }

  const handleFile = (file: File | undefined) => {
    if (!file || !onChange) return
    if (!isAllowedFile(file)) {
      setUploadError('Недопустимый формат. Загрузите фото или документ (без GIF, видео и аудио).')
      return
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError('Файл слишком большой. Максимальный размер — 20 МБ.')
      return
    }
    setUploadError(null)
    upload.upload(
      { projectId, documentType, file },
      {
        onSuccess: () => {
          setUploadError(null)
          onChange(file.name)
        },
        onError: (message) => {
          setUploadError(message)
        },
      },
    )
  }

  const showFileRow =
    variant === 'uploaded' || variant === 'confirmed' || (variant === 'rejected' && Boolean(value))
  const canReplace = isUpload && (variant === 'uploaded' || variant === 'rejected')
  const canDownload = Boolean(value)

  const fileNameClassName = cn(
    'min-w-0 flex-1 truncate text-left text-sm',
    variant === 'confirmed' && 'text-[#2E7D32]',
    variant === 'rejected' && 'text-[#D25252]',
    variant === 'uploaded' && 'text-[#B0B0B0]',
    canDownload && 'cursor-pointer underline-offset-2 hover:underline',
    downloadDisabled && 'cursor-not-allowed opacity-70',
  )

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {isUpload ? (
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={FILE_ACCEPT}
          className="sr-only"
          disabled={uploadDisabled || variant === 'confirmed'}
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      ) : null}
      {showFileRow ? (
        <div className="flex min-w-0 items-stretch gap-2">
          <div
            className={cn(
              'flex h-9 min-w-0 flex-1 items-center gap-2 rounded-[10px] px-3 py-2',
              variant === 'confirmed' && 'bg-[#E8F5E9]',
              variant === 'rejected' && 'bg-[#FDEDED]',
              variant === 'uploaded' && 'bg-[#F3F3F3]',
            )}
          >
            <DocumentIcon
              className={cn(
                'size-3 shrink-0 [&_path]:fill-current',
                variant === 'confirmed' && 'text-[#2E7D32]',
                variant === 'rejected' && 'text-[#D25252]',
                variant === 'uploaded' && 'text-[#B0B0B0]',
              )}
              aria-hidden
            />
            {canDownload ? (
              <button
                type="button"
                className={fileNameClassName}
                title={value}
                disabled={downloadDisabled}
                onClick={requestDownload}
              >
                {value}
              </button>
            ) : (
              <span className={fileNameClassName} title={value}>
                {value}
              </span>
            )}
          </div>
          {canReplace ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9 shrink-0 cursor-pointer rounded-[10px] border-none bg-[#F3F3F3] text-[#B0B0B0]"
              disabled={uploadDisabled}
              aria-label="Выбрать другой файл"
              onClick={openPicker}
            >
              <CycleIcon className="size-5 [&_path]:fill-current" />
            </Button>
          ) : null}
        </div>
      ) : isUpload ? (
        <Button
          type="button"
          className="h-9 w-full cursor-pointer justify-center rounded-[10px] border-[#B1B1B1] text-sm font-normal"
          disabled={uploadDisabled}
          onClick={openPicker}
        >
          {upload.isPending ? 'Загрузка…' : addButtonLabel}
        </Button>
      ) : null}
      {uploadError ? (
        <p className="text-destructive text-sm" role="alert">
          {uploadError}
        </p>
      ) : null}
      {canDownload ? (
        <ConfirmDownloadDialog
          open={confirmOpen}
          onOpenChange={(next) => {
            if (!download.isPending) setConfirmOpen(next)
          }}
          fileName={value}
          onConfirm={confirmDownload}
          isPending={download.isPending}
        />
      ) : null}
    </div>
  )
}
