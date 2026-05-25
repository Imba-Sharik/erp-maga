import { useId, useRef } from 'react'

import { useUploadStageDocument } from '@/features/upload-stage-document'
import { CycleIcon, DocumentIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import type { StageDocumentType } from '@/entities/stage-document-files'

import type { StageDocumentFieldVariant } from '../lib/document-status-fields'

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

interface StageDocumentFieldProps {
  projectId: string | number
  documentType: StageDocumentType
  value: string
  variant: StageDocumentFieldVariant
  onChange: (fileName: string) => void
  disabled?: boolean
}

export function StageDocumentField({
  projectId,
  documentType,
  value,
  variant,
  onChange,
  disabled,
}: StageDocumentFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const { upload } = useUploadStageDocument()

  const openPicker = () => {
    if (!disabled && variant !== 'confirmed') inputRef.current?.click()
  }

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (!isAllowedFile(file)) {
      window.alert('Недопустимый формат. Загрузите фото или документ (без GIF, видео и аудио).')
      return
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      window.alert('Файл слишком большой. Максимальный размер — 20 МБ.')
      return
    }
    upload({ projectId, documentType, file })
    onChange(file.name)
  }

  const showFileRow =
    variant === 'uploaded' || variant === 'confirmed' || (variant === 'rejected' && Boolean(value))
  const canReplace = variant === 'uploaded' || variant === 'rejected'

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={FILE_ACCEPT}
        className="sr-only"
        disabled={disabled || variant === 'confirmed'}
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
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
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-sm',
                variant === 'confirmed' && 'text-[#2E7D32]',
                variant === 'rejected' && 'text-[#D25252]',
                variant === 'uploaded' && 'text-[#B0B0B0]',
              )}
              title={value}
            >
              {value}
            </span>
          </div>
          {canReplace ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9 shrink-0 cursor-pointer rounded-[10px] border-none bg-[#F3F3F3] text-[#B0B0B0]"
              disabled={disabled}
              aria-label="Выбрать другой файл"
              onClick={openPicker}
            >
              <CycleIcon className="size-5 [&_path]:fill-current" />
            </Button>
          ) : null}
        </div>
      ) : (
        <Button
          type="button"
          className="h-9 w-full cursor-pointer justify-center rounded-[10px] border-[#B1B1B1] text-sm font-normal"
          disabled={disabled}
          onClick={openPicker}
        >
          Добавить документ
        </Button>
      )}
    </div>
  )
}
