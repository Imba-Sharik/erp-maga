import { useRef, useState } from 'react'

import { FILE_ACCEPT, validateAttachment } from '@/features/stage-document'
import { CycleIcon, DocumentIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

/**
 * ДЕМО-поле прикрепления сметы на этапе «Расчёт подготовлен».
 *
 * Бэкенд пока не знает про тип документа «смета» (enum `document_type` =
 * project_closing | staff_receipts | subrent_closing), поэтому файл не загружается
 * на сервер — в форме сохраняется только имя файла. Когда бэк добавит `estimate`,
 * этот компонент заменяется на `StageDocumentField` с `documentType="estimate"`.
 */
export interface StageEstimateFieldProps {
  value: string
  onChange?: (fileName: string) => void
  disabled?: boolean
  addButtonLabel?: string
  /** `upload` — менеджер прикрепляет; `download` — readonly-вид в пройденном этапе. */
  interaction: 'upload' | 'download'
}

export function StageEstimateField({
  value,
  onChange,
  disabled,
  addButtonLabel = 'Добавить смету',
  interaction,
}: StageEstimateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const isUpload = interaction === 'upload'
  const openPicker = () => {
    if (!isUpload || disabled) return
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
    onChange(file.name)
  }

  const canReplace = isUpload && Boolean(value) && !disabled

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {isUpload ? (
        <input
          ref={inputRef}
          type="file"
          accept={FILE_ACCEPT}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      ) : null}
      {value ? (
        <div className="flex min-w-0 items-stretch gap-2">
          <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-[10px] bg-[#F3F3F3] px-3 py-2">
            <DocumentIcon
              className="size-3 shrink-0 text-[#B0B0B0] [&_path]:fill-current"
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-left text-sm text-[#454545]" title={value}>
              {value}
            </span>
          </div>
          {canReplace ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9 shrink-0 rounded-[10px] border-none bg-[#F3F3F3] text-[#B0B0B0]"
              disabled={disabled}
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
          className="h-9 w-full justify-center rounded-[10px] border-[#B1B1B1] text-sm font-normal"
          disabled={disabled}
          onClick={openPicker}
        >
          {addButtonLabel}
        </Button>
      ) : (
        <div className="flex h-9 w-full items-center rounded-[10px] border border-[#B1B1B1] bg-[#FAFAFA] px-3 py-2 text-sm">
          <span className="text-muted-foreground">—</span>
        </div>
      )}
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
