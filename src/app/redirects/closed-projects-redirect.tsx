import { Navigate, useParams } from 'react-router-dom'

export function RedirectClosedProjectsList() {
  return <Navigate to="/closing" replace />
}

export function RedirectClosedProjectDetail() {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={`/closing/${id ?? ''}`} replace />
}
