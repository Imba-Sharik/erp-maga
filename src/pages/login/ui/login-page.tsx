import { MagLogo } from '@/shared/assets'
import { DevLoginButtons, LoginForm } from '@/features/auth'

const IS_DEV = import.meta.env.DEV

export function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-[#FAF9F6] px-6 pt-6 pb-[14vh]">
      <div className="flex flex-col items-center gap-2.5">
        <MagLogo aria-label="ERP MAG" className="size-12 rounded-xl" />
        <span className="text-base font-bold text-[#1B1A17]">ERP MAG</span>
      </div>

      <div className="flex w-full max-w-90 flex-col gap-5 rounded-2xl border border-[#E9E6DD] bg-white p-8">
        <LoginForm />
        {IS_DEV && (
          <>
            <div className="h-px bg-[#E9E6DD]" />
            <DevLoginButtons />
          </>
        )}
      </div>
    </main>
  )
}
