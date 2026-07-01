import { useEffect, useState } from 'react'

import type { ProjectDetail } from '@/entities/project'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'

import { useEditProjectTitle } from '../model/use-edit-project-title'

interface EditProjectTitleDialogProps {
  project: ProjectDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Модалка редактирования названия проекта (ERP-231). Модалка выбрана вместо инлайна:
 * на мобиле длинное название не помещается в узкий заголовок. Enter — сохранить,
 * пустое название — нельзя.
 */
export function EditProjectTitleDialog({ project, open, onOpenChange }: EditProjectTitleDialogProps) {
  const [value, setValue] = useState(project.title)
  const { submit, isPending } = useEditProjectTitle({ onSuccess: () => onOpenChange(false) })

  // При каждом открытии — сброс поля к актуальному названию.
  useEffect(() => {
    if (open) setValue(project.title)
  }, [open, project.title])

  const trimmed = value.trim()
  const canSave = trimmed.length > 0 && !isPending

  const handleSave = () => {
    if (!canSave) return
    submit({ project, title: value })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground text-left">
            Изменить название
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSave()
              }
            }}
            placeholder="Название проекта"
            aria-label="Название проекта"
            disabled={isPending}
            className="border-border-strong bg-card h-10 rounded-[10px]"
          />
          {trimmed.length === 0 ? (
            <p className="text-destructive text-xs">Название не может быть пустым</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-[10px]"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Отмена
          </Button>
          <Button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-[10px]"
            onClick={handleSave}
            disabled={!canSave}
          >
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
