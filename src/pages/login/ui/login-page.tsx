import { useEffect } from 'react'

import { MagLogo } from '@/shared/assets'
import { DevLoginButtons, LoginForm } from '@/features/auth'

const IS_DEV = import.meta.env.DEV

export function LoginPage() {
  // Подстраховка от залипших body-стилей Radix (Sheet/DropdownMenu) после logout:
  // если AppLayout размонтировался до того, как Radix успел снять
  // pointer-events:none / overflow:hidden / data-scroll-locked, инпуты на /login
  // становятся некликабельными до перезагрузки страницы.
  useEffect(() => {
    document.body.style.pointerEvents = ''
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
    document.body.removeAttribute('data-scroll-locked')
  }, [])

  return (
    <main className="bg-surface-subtle flex min-h-svh flex-col items-center justify-center gap-8 px-6 pt-6 pb-[14vh]">
      <div className="flex flex-col items-center gap-2.5">
        <MagLogo aria-label="ERP MAG" className="size-12 rounded-xl" />
        <span className="text-foreground text-base font-bold">ERP MAG</span>
      </div>

      <div className="border-border flex w-full max-w-90 flex-col gap-5 rounded-2xl border bg-white p-8">
        <LoginForm />
        {IS_DEV && (
          <>
            <div className="bg-surface-hover h-px" />
            <DevLoginButtons />
          </>
        )}
      </div>
    </main>
  )
}
