export function ProfilePage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-foreground font-bold">Профиль</h1>
          <p className="text-muted-foreground hidden max-w-[640px] text-sm md:block">
            Здесь будут данные профиля.
          </p>
        </div>
      </header>
    </div>
  )
}
