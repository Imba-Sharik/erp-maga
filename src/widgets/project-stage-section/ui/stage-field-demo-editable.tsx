import { useState } from 'react'

import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'

import type { StageFieldConfig } from '../lib/fields-map'
import { StageFieldShell } from './stage-field-shell'

interface StageFieldDemoEditableProps {
  field: StageFieldConfig
  initialValue?: string
  className?: string
}

// TODO: демо-заглушка для пройденных этапов. Локальный useState без формы,
// валидации и persist. Перед прод-релизом заменить на RHF-форму, привязанную
// к мутации обновления stage-данных.
export function StageFieldDemoEditable({
  field,
  initialValue,
  className,
}: StageFieldDemoEditableProps) {
  const [value, setValue] = useState(initialValue ?? '')
  const isTextarea = field.type === 'textarea'

  return (
    <StageFieldShell
      label={field.label}
      required={field.required}
      className={isTextarea ? `h-full ${className ?? ''}` : className}
    >
      {field.type === 'select' ? (
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="h-9 w-full rounded-[10px] border-[#B1B1B1] bg-white text-[13px]">
            <SelectValue placeholder={field.placeholder ?? 'Выберите…'} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : isTextarea ? (
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={field.placeholder}
          className="h-full min-h-[90px] flex-1 resize-none rounded-[10px] border-[#B1B1B1] bg-white text-[13px]"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={field.placeholder}
          className="h-9 rounded-[10px] border-[#B1B1B1] bg-white text-[13px]"
        />
      )}
    </StageFieldShell>
  )
}
