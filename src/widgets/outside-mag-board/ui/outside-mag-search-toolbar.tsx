import { Search } from 'lucide-react'

import { Input } from '@/shared/ui/input'

interface OutsideMagSearchToolbarProps {
  search: string
  onChangeSearch: (value: string) => void
}

export function OutsideMagSearchToolbar({ search, onChangeSearch }: OutsideMagSearchToolbarProps) {
  return (
    <div className="flex shrink-0 flex-col gap-3 md:flex-row md:items-center">
      <div className="relative w-full md:w-75">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#ACACAC]" />
        <Input
          type="search"
          placeholder="Поиск проектов"
          value={search}
          onChange={(e) => onChangeSearch(e.target.value)}
          className="h-10 rounded-[10px] border-[#B1B1B1] bg-white pl-9 placeholder:text-[#ACACAC]"
        />
      </div>
    </div>
  )
}
