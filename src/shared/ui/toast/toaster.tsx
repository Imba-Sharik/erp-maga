import { Toaster as SonnerToaster } from 'sonner'

/**
 * Тосты приложения. Один экземпляр монтируется в корне (`app/index.tsx`).
 *
 * `unstyled: true` отключает дефолтную тему sonner — карточку рисуем сами под
 * дизайн проекта: белый фон, текст `#454545`, мягкая тень, скругление 15px.
 * Успех подсвечивает иконку акцентом воронки (`funnel-preproject`), ошибка —
 * красная карточка `#D25252` / `#FFF3F3` (как кнопка «Вне контура MAG»).
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
            'flex w-full items-center gap-3 rounded-[15px] border border-[#E9E6DD] bg-white p-4 font-sans text-sm text-[#454545] shadow-[0_8px_30px_rgba(0,0,0,0.12)]',
          content: 'flex min-w-0 flex-col gap-0.5',
          title: 'truncate font-medium text-[#454545]',
          description: 'text-xs text-[#ACACAC]',
          icon: 'flex shrink-0 items-center [&>svg]:size-5 [&_[data-icon]]:text-funnel-preproject',
          success: '[&_[data-icon]]:text-funnel-preproject',
          error: 'border-[#F3D2D2] bg-[#FFF3F3] text-[#D25252] [&_[data-icon]]:text-[#D25252]',
          actionButton: 'rounded-[10px] bg-[#454545] px-2.5 py-1 text-xs text-white',
          cancelButton: 'rounded-[10px] px-2.5 py-1 text-xs text-[#454545]',
        },
      }}
    />
  )
}
