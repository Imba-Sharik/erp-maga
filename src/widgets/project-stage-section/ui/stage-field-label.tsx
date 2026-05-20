import { Label } from '@/shared/ui/label'
import { useFormField } from '@/shared/ui/form'
import { cn } from '@/shared/lib/utils'

import { FieldLabelText } from './field-label-text'

interface StageFieldLabelProps {
  label: string
  required?: boolean
  className?: string
  form?: boolean
}

function StageFieldLabelContent({
  label,
  required,
}: Pick<StageFieldLabelProps, 'label' | 'required'>) {
  return (
    <span>
      <FieldLabelText label={label} required={required} />
    </span>
  )
}

function StageFieldLabelForm({
  label,
  required,
  className,
}: Pick<StageFieldLabelProps, 'label' | 'required' | 'className'>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      htmlFor={formItemId}
      className={cn(
        'data-[error=true]:text-destructive gap-0 text-xs font-medium text-[#454545]',
        className,
      )}
    >
      <StageFieldLabelContent label={label} required={required} />
    </Label>
  )
}

function StageFieldLabelStatic({
  label,
  required,
  className,
}: Pick<StageFieldLabelProps, 'label' | 'required' | 'className'>) {
  return (
    <span className={cn('text-xs font-medium text-[#454545]', className)}>
      <StageFieldLabelContent label={label} required={required} />
    </span>
  )
}

export function StageFieldLabel({ label, required, className, form }: StageFieldLabelProps) {
  if (form) {
    return <StageFieldLabelForm label={label} required={required} className={className} />
  }
  return <StageFieldLabelStatic label={label} required={required} className={className} />
}
