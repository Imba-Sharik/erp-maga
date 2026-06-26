import { useState } from 'react'

import { useUsersList } from '@/shared/api/generated/hooks/usersController/useUsersList'
import { useDebouncedValue } from '@/shared/hooks'
import { formatDateTime } from '@/shared/lib/date'
import {
  GridTableCell,
  GridTableHeaderLabel,
  GridTableRow,
  GridTableView,
  GridTableViewport,
  TABLE_EMPTY,
} from '@/shared/ui/grid-table'
import { SearchBar } from '@/shared/ui/search-bar'

const USERS_TABLE_GRID_TEMPLATE =
  'minmax(240px, 2fr) minmax(140px, 1fr) minmax(220px, 1.4fr) minmax(170px, 1fr)'

const BACKEND_ROLE_LABELS: Record<string, string> = {
  manager_mag: 'Менеджер',
  lead: 'Руководитель',
  accountant: 'Бухгалтер',
  admin: 'Администратор',
}

function getRoleLabel(role: string): string {
  return BACKEND_ROLE_LABELS[role] ?? role
}

export function UsersPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const trimmedSearch = debouncedSearch.trim()

  const query = useUsersList(trimmedSearch ? { search: trimmedSearch } : undefined)
  const users = query.data ?? []

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-foreground font-bold">Пользователи</h1>
          <p className="text-muted-foreground hidden max-w-[700px] text-sm md:block">
            Список пользователей системы с ролями и датой регистрации.
          </p>
        </div>
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени или почте"
          groupClassName="w-full md:w-75"
        />
      </header>

      <GridTableViewport>
        <GridTableView
          minWidth="780px"
          gridTemplate={USERS_TABLE_GRID_TEMPLATE}
          header={
            <>
              <GridTableHeaderLabel>Пользователь</GridTableHeaderLabel>
              <GridTableHeaderLabel>Роль</GridTableHeaderLabel>
              <GridTableHeaderLabel>Почта</GridTableHeaderLabel>
              <GridTableHeaderLabel>Появление в системе</GridTableHeaderLabel>
            </>
          }
          isLoading={query.isPending}
          isError={query.isError}
          errorMessage="Не удалось загрузить список пользователей."
          isEmpty={!query.isPending && !query.isError && users.length === 0}
          emptyMessage="Пользователи не найдены."
          skeletonColumnCount={4}
        >
          {users.map((user) => (
            <GridTableRow key={user.id} gridTemplate={USERS_TABLE_GRID_TEMPLATE}>
              <GridTableCell muted>{user.full_name || TABLE_EMPTY}</GridTableCell>
              <GridTableCell muted>{getRoleLabel(user.role)}</GridTableCell>
              <GridTableCell muted>{user.email || TABLE_EMPTY}</GridTableCell>
              <GridTableCell muted>{formatDateTime(user.created_at) || TABLE_EMPTY}</GridTableCell>
            </GridTableRow>
          ))}
        </GridTableView>
      </GridTableViewport>
    </div>
  )
}
