import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-muted-foreground">Страница не найдена</p>
      <Link to="/" className="text-primary underline">
        На главную
      </Link>
    </div>
  )
}
