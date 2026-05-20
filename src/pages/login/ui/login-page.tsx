import { MagLogo } from '@/shared/assets'
import { LoginForm } from '@/features/auth'

export function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-[#FAF9F6] px-6 pt-6 pb-[14vh]">
      <div className="flex flex-col items-center gap-2.5">
        <MagLogo aria-label="ERP MAG" className="size-12 rounded-xl" />
        <span className="text-base font-bold text-[#1B1A17]">ERP MAG</span>
      </div>

      <div className="w-full max-w-90 rounded-2xl border border-[#E9E6DD] bg-white p-8">
        <LoginForm />
      </div>
    </main>
  )
}
