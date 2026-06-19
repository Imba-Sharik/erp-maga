import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

import { PROJECTS_SORT_OPTIONS } from '../lib/projects-sort-catalog'

interface ProjectsSortSelectProps {
  value: string
  onChange: (value: string) => void
  triggerClassName?: string
  disabled?: boolean
}

export function ProjectsSortSelect({
  value,
  onChange,
  triggerClassName,
  disabled,
}: ProjectsSortSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PROJECTS_SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
