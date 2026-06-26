import type { Project } from '@/entities/project'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

import { useDeleteProject } from '../model/use-delete-project'

export interface ConfirmDeleteProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
}

export function ConfirmDeleteProjectDialog({
  open,
  onOpenChange,
  project,
}: ConfirmDeleteProjectDialogProps) {
  const { submit, isPending, isError, errorMessage, reset } = useDeleteProject({
    onSuccess: () => onOpenChange(false),
  })

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">Удалить проект?</DialogTitle>
          <DialogDescription>
            Проект будет помечен удалённым и пропадёт из списков. Действие доступно только
            администратору.
          </DialogDescription>
          {project?.title ? (
            <p className="text-foreground-soft text-sm">Проект: {project.title}</p>
          ) : null}
        </DialogHeader>
        {isError && errorMessage ? (
          <p className="text-destructive text-sm">{errorMessage}</p>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-[10px]"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-[10px]"
            onClick={() => project && submit(project)}
            disabled={isPending || !project}
          >
            {isPending ? 'Удаление…' : 'Удалить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
