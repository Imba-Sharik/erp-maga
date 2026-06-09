import type { StageDocumentFieldVariant } from '@/entities/project-documents'
import { cn } from '@/shared/lib/utils'

type FileRowVariant = Exclude<StageDocumentFieldVariant, 'empty'>

const VARIANT_TEXT: Record<FileRowVariant, string> = {
  confirmed: 'text-[#2E7D32]',
  rejected: 'text-[#D25252]',
  uploaded: 'text-[#B0B0B0]',
}

const VARIANT_BG: Record<FileRowVariant, string> = {
  confirmed: 'bg-[#E8F5E9]',
  rejected: 'bg-[#FDEDED]',
  uploaded: 'bg-[#F3F3F3]',
}

const VARIANT_ICON: Record<FileRowVariant, string> = {
  confirmed: 'text-[#2E7D32]',
  rejected: 'text-[#D25252]',
  uploaded: 'text-[#B0B0B0]',
}

export function resolveFileRowVariant(variant: StageDocumentFieldVariant): FileRowVariant {
  return variant === 'empty' ? 'uploaded' : variant
}

export function getAttachmentFileRowClassNames(variant: StageDocumentFieldVariant) {
  const rowVariant = resolveFileRowVariant(variant)

  return {
    container: cn(
      'flex h-9 min-w-0 flex-1 items-center gap-2 rounded-[10px] px-3 py-2',
      VARIANT_BG[rowVariant],
    ),
    icon: cn('size-3 shrink-0 [&_path]:fill-current', VARIANT_ICON[rowVariant]),
    fileName: cn('min-w-0 flex-1 truncate text-left text-sm', VARIANT_TEXT[rowVariant]),
  }
}

export function getAttachmentFileNameClassName(
  variant: StageDocumentFieldVariant,
  canDownload: boolean,
  downloadDisabled: boolean,
) {
  const { fileName } = getAttachmentFileRowClassNames(variant)

  return cn(
    fileName,
    canDownload && 'cursor-pointer underline-offset-2 hover:underline',
    downloadDisabled && 'cursor-not-allowed opacity-70',
  )
}
