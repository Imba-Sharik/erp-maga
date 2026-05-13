import { useMemo, useState } from 'react'
import { type Project } from '@/entities/project'
import { filterProjects } from '../lib/filter-projects'
import { ProjectsBoardToolbar } from './projects-board-toolbar'
import { ProjectsKanban } from './projects-kanban'

interface ProjectsBoardProps {
  projects: Project[]
}

export function ProjectsBoard({ projects }: ProjectsBoardProps) {
  const [search, setSearch] = useState('')
  const [city, setCity] = useState<string | null>(null)
  const [hall, setHall] = useState<string | null>(null)
  const [loft, setLoft] = useState<string | null>(null)

  const filtered = useMemo(
    () => filterProjects(projects, { search, city, hall, loft }),
    [projects, search, city, hall, loft],
  )

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <ProjectsBoardToolbar
        search={search}
        city={city}
        hall={hall}
        loft={loft}
        onChangeSearch={setSearch}
        onChangeCity={setCity}
        onChangeHall={setHall}
        onChangeLoft={setLoft}
      />
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <ProjectsKanban projects={filtered} />
      </div>
    </div>
  )
}
