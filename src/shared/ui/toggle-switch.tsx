import { cn } from '@/shared/lib/utils'

interface ToggleSwitchProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function ToggleSwitch({ label, checked, onChange, className }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'text-foreground-soft flex shrink-0 cursor-pointer items-center gap-2.5 text-sm',
        className,
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-border-medium',
        )}
      >
        <span
          className={cn(
            'bg-card absolute top-0.5 size-4 rounded-full shadow-sm transition-all',
            checked ? 'left-[18px]' : 'left-0.5',
          )}
        />
      </span>
    </button>
  )
}
