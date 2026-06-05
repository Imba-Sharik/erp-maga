import { formatMoney, parseMoney } from '@/entities/project-articles'
import { Input } from '@/shared/ui/input'

interface MoneyInputProps {
  value: number
  onCommit: (next: number) => void
  className?: string
}

/** Money-input для manager-полей: цифры фильтруются, форматирование пробелов + ₽ живое. */
export function MoneyInput({
  value,
  onCommit,
  className = 'h-9 rounded-[10px] border-[#B1B1B1] bg-white text-sm',
}: MoneyInputProps) {
  const display = value > 0 ? formatMoney(value) : ''
  return (
    <Input
      inputMode="numeric"
      value={display}
      placeholder="Введите сумму"
      onChange={(e) => onCommit(parseMoney(e.target.value))}
      className={className}
    />
  )
}
