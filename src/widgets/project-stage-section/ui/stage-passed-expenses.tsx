import { Check, ChevronDown, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible'
import { cn } from '@/shared/lib/utils'

import { StageFieldShell } from './stage-field-shell'

type Source = 'manager' | 'system'

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

function ArticleField({
  label,
  value,
  percent,
}: {
  label: string
  value: string
  percent: string
}) {
  return (
    <StageFieldShell label={label}>
      <div className="grid grid-cols-[1fr_56px] gap-1.5">
        <ReadonlyBox value={value} source="manager" />
        <ReadonlyBox value={percent} source="system" align="center" />
      </div>
    </StageFieldShell>
  )
}

function SimpleField({
  label,
  value,
  source = 'manager',
}: {
  label: string
  value: string
  source?: Source
}) {
  return (
    <StageFieldShell label={label}>
      <ReadonlyBox value={value} source={source} />
    </StageFieldShell>
  )
}

function DualField({
  a,
  b,
}: {
  a: { label: string; value: string }
  b: { label: string; value: string }
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <SimpleField label={a.label} value={a.value} source="system" />
      <SimpleField label={b.label} value={b.value} source="system" />
    </div>
  )
}

function ActionField({ children }: { children: ReactNode }) {
  return <StageFieldShell label="Действие">{children}</StageFieldShell>
}

function SubsectionHeader({ title }: { title: string }) {
  return (
    <CollapsibleTrigger className="flex items-center gap-1.5 text-sm">
      <span className="font-medium text-[#454545]">{title}</span>
      <ChevronDown className="text-muted-foreground size-3.5" />
    </CollapsibleTrigger>
  )
}

export function StagePassedExpenses() {
  return (
    <Collapsible defaultOpen className="w-full">
      <div className="flex flex-col gap-5 rounded-[15px] border border-[#B1B1B1] bg-white p-5">
        <CollapsibleTrigger className="flex w-full items-center gap-1.5 text-sm">
          <span className="font-medium text-[#454545]">Этап пройден:</span>
          <span className="text-funnel-closing font-semibold">Расходы внесены</span>
          <ChevronDown className="text-muted-foreground size-3.5" />
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-5">
          <div className="h-px w-full bg-[#F0F0F0]" />

          <Collapsible defaultOpen className="flex flex-col gap-4">
            <SubsectionHeader title="Расходы: Продажная часть (основной блок)" />
            <CollapsibleContent>
              <div className="grid grid-cols-1 items-start gap-x-5 gap-y-4 @[640px]:grid-cols-3">
                <ArticleField label="Оборудование" value="170 000 ₽" percent="53,5%" />
                <ArticleField label="Интернет" value="170 000 ₽" percent="1,5%" />
                <SimpleField label="Единый % налога" value="10%" source="manager" />

                <ArticleField label="Персонал" value="170 000 ₽" percent="19,9%" />
                <ArticleField label="Расходники" value="170 000 ₽" percent="2%" />
                <SimpleField label="Сумма налога" value="170 000 ₽" source="system" />

                <ArticleField label="Субаренда" value="170 000 ₽" percent="7%" />
                <ArticleField label="Экран" value="170 000 ₽" percent="10,5%" />
                <DualField
                  a={{ label: 'Итого', value: '1 000 000 ₽' }}
                  b={{ label: 'Итого с налогом', value: '1 170 000 ₽' }}
                />

                <ArticleField label="Транспорт" value="170 000 ₽" percent="5,3%" />
                <ArticleField label="ТМ" value="170 000 ₽" percent="0%" />
                <ActionField>
                  <button
                    type="button"
                    disabled
                    className="text-funnel-closing border-funnel-closing/40 bg-funnel-closing/10 inline-flex h-9 w-fit items-center gap-1.5 self-start rounded-[10px] border px-3 text-[13px] font-medium"
                  >
                    <Check className="size-3.5" />
                    Бэклайн добавлен
                  </button>
                </ActionField>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible defaultOpen className="flex flex-col gap-4">
            <SubsectionHeader title="Расходы: Бэклайн (дополнительный блок)" />
            <CollapsibleContent>
              <div className="grid grid-cols-1 items-start gap-x-5 gap-y-4 @[640px]:grid-cols-3">
                <ArticleField label="Оборудование" value="170 000 ₽" percent="53,5%" />
                <ArticleField label="Транспорт" value="170 000 ₽" percent="5,3%" />
                <SimpleField label="Налог" value="10%" source="manager" />

                <ArticleField label="Персонал" value="170 000 ₽" percent="19,9%" />
                <ArticleField label="Расходники" value="170 000 ₽" percent="1,5%" />
                <SimpleField label="Итого бэклайн" value="170 000 ₽" source="system" />

                <ArticleField label="Субаренда" value="170 000 ₽" percent="7%" />
                <ArticleField label="ТМ" value="170 000 ₽" percent="2%" />
                <ActionField>
                  <button
                    type="button"
                    className="inline-flex h-9 w-fit items-center gap-1.5 self-start rounded-[10px] border border-red-300 bg-white px-3 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5" />
                    Удалить
                  </button>
                </ActionField>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex flex-col gap-4">
            <span className="text-sm font-medium text-[#454545]">Информация</span>
            <div className="grid grid-cols-1 items-start gap-x-5 gap-y-4 @[640px]:grid-cols-3">
              <StageFieldShell label="Комментарий к расходам*">
                <div className="flex min-h-[90px] w-full items-start rounded-[10px] border border-[#B1B1B1] bg-[#FAFAFA] px-3 py-2 text-[13px] text-[#454545]">
                  Всё прошло успешно, клиент остался крайне доволен предоставленным
                  оборудованием
                </div>
              </StageFieldShell>
              <SimpleField
                label="Статус перевёл менеджер"
                value="Иванов Иван Иванович"
                source="system"
              />
              <SimpleField label="Дата перехода в статус" value="09-05-2026" source="system" />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
