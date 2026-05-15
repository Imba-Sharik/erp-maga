import { ChevronDown, CircleDollarSign, TrendingDown } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible'
import { cn } from '@/shared/lib/utils'

import { StageFieldShell } from './stage-field-shell'

type Source = 'manager' | 'system'
type Icon = ComponentType<SVGProps<SVGSVGElement>>

interface BonusRow {
  label: string
  sales: string
  expense: string
  netProfit: string
  bonusPercent: string
  bonusAmount: string
}

const BONUS_ROWS: BonusRow[] = [
  { label: 'Оборудование', sales: '170 000 ₽', expense: '90 000 ₽', netProfit: '80 000 ₽', bonusPercent: '53,5%', bonusAmount: '43 540 ₽' },
  { label: 'Субаренда', sales: '170 000 ₽', expense: '90 000 ₽', netProfit: '80 000 ₽', bonusPercent: '53,5%', bonusAmount: '43 540 ₽' },
  { label: 'Транспорт', sales: '170 000 ₽', expense: '90 000 ₽', netProfit: '80 000 ₽', bonusPercent: '53,5%', bonusAmount: '43 540 ₽' },
  { label: 'Интернет', sales: '170 000 ₽', expense: '90 000 ₽', netProfit: '80 000 ₽', bonusPercent: '53,5%', bonusAmount: '43 540 ₽' },
  { label: 'Расходники', sales: '170 000 ₽', expense: '90 000 ₽', netProfit: '80 000 ₽', bonusPercent: '53,5%', bonusAmount: '43 540 ₽' },
  { label: 'Экран', sales: '170 000 ₽', expense: '90 000 ₽', netProfit: '80 000 ₽', bonusPercent: '53,5%', bonusAmount: '43 540 ₽' },
  { label: 'Оборудование', sales: '170 000 ₽', expense: '90 000 ₽', netProfit: '80 000 ₽', bonusPercent: '53,5%', bonusAmount: '43 540 ₽' },
  { label: 'ТМ', sales: '170 000 ₽', expense: '90 000 ₽', netProfit: '80 000 ₽', bonusPercent: '53,5%', bonusAmount: '43 540 ₽' },
]

function ReadonlyBox({
  value,
  source,
  className,
  align = 'left',
}: {
  value: string
  source: Source
  className?: string
  align?: 'left' | 'center'
}) {
  const isSystem = source === 'system'
  return (
    <div
      title={isSystem ? 'Заполнено системой' : undefined}
      className={cn(
        'flex h-9 items-center rounded-[10px] border px-3 text-[13px]',
        align === 'center' ? 'justify-center' : 'justify-start',
        isSystem
          ? 'border-dashed border-[#C7C7C7] bg-[#F4F2EC] text-[#6B6B6B] italic'
          : 'border-[#B1B1B1] bg-[#FAFAFA] text-[#454545]',
        className,
      )}
    >
      {value}
    </div>
  )
}

function IconChip({ icon: Icon }: { icon: Icon }) {
  return <Icon className="size-4 shrink-0 text-[#6B6B6B]" />
}

function Operator({ children }: { children: string }) {
  return <span className="text-[#6B6B6B] text-[13px] font-medium px-1">{children}</span>
}

function ArticleRow({ row }: { row: BonusRow }) {
  return (
    <div className="grid grid-cols-1 items-end gap-4 @[900px]:grid-cols-[minmax(0,1fr)_88px_120px]">
      <div className="flex flex-col gap-1.5 min-w-0">
        <span className="text-xs font-medium text-[#454545]">{row.label}</span>
        <div className="flex items-center gap-1.5 min-w-0">
          <IconChip icon={CircleDollarSign} />
          <ReadonlyBox value={row.sales} source="manager" className="min-w-0 flex-1" />
          <Operator>−</Operator>
          <IconChip icon={TrendingDown} />
          <ReadonlyBox value={row.expense} source="manager" className="min-w-0 flex-1" />
          <Operator>=</Operator>
          <ReadonlyBox value={row.netProfit} source="system" className="min-w-0 flex-1" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[#454545]">% Бонуса</span>
        <ReadonlyBox value={row.bonusPercent} source="system" align="center" />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[#454545]">Бонус по статье</span>
        <ReadonlyBox value={row.bonusAmount} source="system" />
      </div>
    </div>
  )
}

export function StagePassedBonus() {
  return (
    <Collapsible defaultOpen className="w-full">
      <div className="flex flex-col gap-5 rounded-[15px] border border-[#B1B1B1] bg-white p-5">
        <CollapsibleTrigger className="flex w-full items-center gap-1.5 text-sm">
          <span className="font-medium text-[#454545]">Этап пройден:</span>
          <span className="text-funnel-closing font-semibold">Бонус рассчитан</span>
          <ChevronDown className="text-muted-foreground size-3.5" />
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-5">
          <div className="h-px w-full bg-[#F0F0F0]" />

          <Collapsible defaultOpen className="flex flex-col gap-4">
            <CollapsibleTrigger className="flex items-center gap-1.5 text-sm">
              <span className="font-medium text-[#454545]">Бонус: Продажная часть (основной блок)</span>
              <ChevronDown className="text-muted-foreground size-3.5" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 gap-5 @[900px]:grid-cols-[minmax(0,1fr)_280px]">
                <div className="flex flex-col gap-4 min-w-0">
                  {BONUS_ROWS.map((row, idx) => (
                    <ArticleRow key={`${row.label}-${idx}`} row={row} />
                  ))}
                </div>
                <div className="flex flex-col justify-between gap-4 @[900px]:border-l @[900px]:border-[#D3D3D3] @[900px]:pl-5">
                  <StageFieldShell label="Данные подтверждены руководителем">
                    <ReadonlyBox value="Иванов Иван Иванович" source="manager" />
                  </StageFieldShell>
                  <StageFieldShell label="Итоговый бонус">
                    <ReadonlyBox value="443 330 ₽" source="system" />
                  </StageFieldShell>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
