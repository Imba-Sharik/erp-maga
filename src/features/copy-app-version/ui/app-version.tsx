import { APP_VERSION, APP_VERSION_LABEL, BUILD_DATE, BUILD_SHA } from '@/shared/config'
import { useCopyToClipboard } from '@/shared/hooks'
import { cn } from '@/shared/lib/utils'
import { toast } from '@/shared/ui/toast'

const BASE_CLASSNAME = 'text-muted-foreground text-start text-xs whitespace-nowrap'
const TOOLTIP = `build ${BUILD_SHA} · ${BUILD_DATE}`

interface AppVersionProps {
  className?: string
}

/**
 * Блок версии приложения. Если копирование в буфер доступно — блок кликабелен и
 * копирует метку версии (с тостом об успехе); иначе рендерится статичным текстом
 * без ховер-аффорданс, чтобы не вводить в заблуждение.
 */
export function AppVersion({ className }: AppVersionProps) {
  const { isSupported, copy } = useCopyToClipboard()

  const content = (
    <>
      v{APP_VERSION}
      <span className="opacity-60"> · {BUILD_SHA}</span>
    </>
  )

  if (!isSupported) {
    return (
      <p title={TOOLTIP} className={cn(BASE_CLASSNAME, className)}>
        {content}
      </p>
    )
  }

  const handleCopy = async () => {
    if (await copy(APP_VERSION_LABEL)) {
      toast.success('Версия скопирована')
    }
  }

  return (
    <button
      type="button"
      title={`${TOOLTIP} — нажмите, чтобы скопировать`}
      onClick={handleCopy}
      className={cn(
        BASE_CLASSNAME,
        'block w-full cursor-pointer rounded-sm underline-offset-2 transition-colors',
        'hover:text-foreground hover:underline',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        className,
      )}
    >
      {content}
    </button>
  )
}
