import { Search } from 'lucide-react'
import type * as React from 'react'

import { cn } from '@/shared/lib/utils'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui/input-group'

type SearchBarProps = Omit<React.ComponentProps<typeof InputGroupInput>, 'type'> & {
  groupClassName?: string
}

export function SearchBar({ className, groupClassName, ...props }: SearchBarProps) {
  return (
    <InputGroup
      className={cn(
        'border-border-strong h-10 rounded-[10px] bg-white shadow-none',
        '[&:has([data-slot=input-group-control]:focus-visible)]:border-ring',
        '[&:has([data-slot=input-group-control]:focus-visible)]:ring-[3px]',
        '[&:has([data-slot=input-group-control]:focus-visible)]:ring-ring/50',
        groupClassName,
      )}
    >
      <InputGroupAddon align="inline-start" className="text-muted-foreground">
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        className={cn('placeholder:text-muted-foreground text-sm', className)}
        {...props}
      />
    </InputGroup>
  )
}
