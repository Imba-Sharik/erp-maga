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
        'h-10 rounded-[10px] border-[#B1B1B1] bg-white shadow-none',
        '[&:has([data-slot=input-group-control]:focus-visible)]:border-ring',
        '[&:has([data-slot=input-group-control]:focus-visible)]:ring-[3px]',
        '[&:has([data-slot=input-group-control]:focus-visible)]:ring-ring/50',
        groupClassName,
      )}
    >
      <InputGroupAddon align="inline-start" className="text-[#ACACAC]">
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        className={cn('text-sm placeholder:text-[#ACACAC]', className)}
        {...props}
      />
    </InputGroup>
  )
}
