import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type BreadcrumbCrumb = {
  label: string
  to?: string
}

type BreadcrumbContextValue = {
  crumbs: BreadcrumbCrumb[]
  setCrumbs: (crumbs: BreadcrumbCrumb[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null)

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [crumbs, setCrumbs] = useState<BreadcrumbCrumb[]>([])
  const value = useMemo(() => ({ crumbs, setCrumbs }), [crumbs])
  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>
}

export function useBreadcrumbValue() {
  const ctx = useContext(BreadcrumbContext)
  if (!ctx) throw new Error('useBreadcrumbValue must be used inside BreadcrumbProvider')
  return ctx
}

export function useBreadcrumb(crumbs: BreadcrumbCrumb[]) {
  const { setCrumbs } = useBreadcrumbValue()
  const key = JSON.stringify(crumbs)
  useEffect(() => {
    setCrumbs(crumbs)
    return () => setCrumbs([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
