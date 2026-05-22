import { useState } from 'react'

import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'

import type { StageFieldConfig } from '../lib/fields-map'
import { StageField } from './stage-field'

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
    <StageField
      label={field.label}
      required={field.required}
      className={isTextarea ? `h-full ${className ?? ''}` : className}
    >
      {field.type === 'select' ? (
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="h-9 w-full rounded-[10px] border-[#B1B1B1] bg-white text-sm">
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
          // fieldSizing: fixed инлайном — гасит авторост базового shadcn-textarea
          // (field-sizing-content). Классом ненадёжно: tailwind-merge не схлопывает
          // field-sizing-*, и content побеждает по порядку в CSS.
          // Высота держится по row-span-2, текст скроллится внутри, соседние поля не уезжают.
          style={{ fieldSizing: 'fixed' }}
          className="native-os-scrollbar h-full min-h-[90px] flex-1 resize-none rounded-[10px] border-[#B1B1B1] bg-white text-sm"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={field.placeholder}
          className="h-9 rounded-[10px] border-[#B1B1B1] bg-white text-sm"
        />
      )}
    </StageField>
  )
}
