import { USER_ROLE_LABELS } from '@/entities/user-role'
import { Button } from '@/shared/ui/button'

import { DEV_ROLES_WITH_CREDS, getDevCredentials, type DevRole } from '../lib/dev-credentials'
import { useLogin } from '../model/use-login'

/**
 * Дев-кнопки на `/login`: вход одним кликом с кредами из env.
 * Идёт через настоящий `/auth/token/` (тот же `useLogin`, что и форма) —
 * с редиректом на исходную страницу после успеха.
 */
export function DevLoginButtons() {
  const { login, isPending, isError } = useLogin()

  if (DEV_ROLES_WITH_CREDS.length === 0) return null

  const handleClick = (role: DevRole) => {
    const creds = getDevCredentials(role)
    if (!creds) return
    login(creds)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-2xs tracking-wide uppercase">
        Dev: войти как
      </span>
      <div className="grid grid-cols-2 gap-2">
        {DEV_ROLES_WITH_CREDS.map((role) => (
          <Button
            key={role}
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => handleClick(role)}
          >
            {USER_ROLE_LABELS[role]}
          </Button>
        ))}
      </div>
      {isError ? (
        <p className="text-destructive text-xs" role="alert">
          Не удалось войти dev-кредами — проверь `.env.local`
        </p>
      ) : null}
    </div>
  )
}
