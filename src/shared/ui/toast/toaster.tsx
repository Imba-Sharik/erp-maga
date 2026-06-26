import { Toaster as SonnerToaster } from 'sonner'

/**
 * Тосты приложения. Один экземпляр монтируется в корне (`app/index.tsx`).
 *
 * `unstyled: true` отключает дефолтную тему sonner — карточку рисуем сами под
 * дизайн проекта: белый фон, текст `foreground-soft`, мягкая тень, скругление 15px.
 * Успех подсвечивает иконку акцентом воронки (`funnel-preproject`), ошибка —
 * красная карточка (токены `error` / `error-surface`, как кнопка «Вне контура MAG»).
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="light"
      richColors={false}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-full items-center gap-3 rounded-[15px] border border-border bg-white p-4 font-sans text-sm text-foreground-soft shadow-[0_8px_30px_rgba(0,0,0,0.12)]',
          content: 'flex min-w-0 flex-col gap-0.5',
          title: 'font-medium break-words text-foreground-soft',
          description: 'text-xs text-muted-foreground',
          icon: 'flex shrink-0 items-center [&>svg]:size-5 [&_[data-icon]]:text-funnel-preproject',
          success: '[&_[data-icon]]:text-funnel-preproject',
          error: 'border-error-border bg-error-surface text-error [&_[data-icon]]:text-error',
          actionButton: 'rounded-[10px] bg-foreground-soft px-2.5 py-1 text-xs text-white',
          cancelButton: 'rounded-[10px] px-2.5 py-1 text-xs text-foreground-soft',
        },
      }}
    />
  )
}
