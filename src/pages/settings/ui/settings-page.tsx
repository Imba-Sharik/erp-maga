import { TelegramLinkSection } from '@/features/link-telegram'

export function SettingsPage() {
  return (
    <div className="flex w-full max-w-4xl flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-foreground font-bold">Настройки</h1>
          <p className="text-muted-foreground hidden max-w-[640px] text-sm md:block">
            Интеграции и параметры вашего аккаунта в MAG.
          </p>
        </div>
      </header>

      <TelegramLinkSection />
    </div>
  )
}
