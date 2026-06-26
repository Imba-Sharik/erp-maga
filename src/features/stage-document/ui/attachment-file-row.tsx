import type { StageDocumentFieldVariant } from '@/entities/project-document'
import { CycleIcon, DocumentIcon } from '@/shared/assets'
import { Button } from '@/shared/ui/button'

import {
  getAttachmentFileNameClassName,
  getAttachmentFileRowClassNames,
} from '../lib/attachment-file-row-styles'

export interface AttachmentFileRowProps {
  value: string
  variant: StageDocumentFieldVariant
  canDownload: boolean
  downloadDisabled: boolean
  onDownload: () => void
  canReplace?: boolean
  replaceDisabled?: boolean
  onReplace?: () => void
}

export function AttachmentFileRow({
  value,
  variant,
  canDownload,
  downloadDisabled,
  onDownload,
  canReplace = false,
  replaceDisabled = false,
  onReplace,
}: AttachmentFileRowProps) {
  const styles = getAttachmentFileRowClassNames(variant)
  const fileNameClassName = getAttachmentFileNameClassName(variant, canDownload, downloadDisabled)

  return (
    <div className="flex min-w-0 items-stretch gap-2">
      <div className={styles.container}>
        <DocumentIcon className={styles.icon} aria-hidden />
        {canDownload ? (
          <button
            type="button"
            className={fileNameClassName}
            title={value}
            disabled={downloadDisabled}
            onClick={onDownload}
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
          className="bg-surface-muted text-muted-foreground size-9 shrink-0 rounded-[10px] border-none"
          disabled={replaceDisabled}
          aria-label="Выбрать другой файл"
          onClick={onReplace}
        >
          <CycleIcon className="size-5 [&_path]:fill-current" />
        </Button>
      ) : null}
    </div>
  )
}
