import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import type { Project } from '@/entities/project'
import { OUTSIDE_MAG_REASON_OPTIONS } from '@/entities/project'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

import { useMoveProjectOutsideMag } from '../model/use-move-project-outside-mag'

const TRIGGER_CLASS =
  'h-10 w-full rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC]'

const reasonValues = ['event_cancelled', 'other_rental', 'no_equipment'] as const

const formSchema = z.object({
  reason: z.enum(reasonValues, { message: 'Выберите причину перевода' }),
})

type FormValues = z.infer<typeof formSchema>

export interface MoveProjectOutsideMagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  /** После успеха — переход (например `/outside-mag` с деталки). */
  redirectOnSuccess?: string
}

export function MoveProjectOutsideMagDialog({
  open,
  onOpenChange,
  project,
  redirectOnSuccess,
}: MoveProjectOutsideMagDialogProps) {
  const navigate = useNavigate()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {} as Partial<FormValues>,
  })

  const { submit, isPending, isError, errorMessage, reset } = useMoveProjectOutsideMag({
    onSuccess: () => {
      onOpenChange(false)
      form.reset()
      reset()
      if (redirectOnSuccess) navigate(redirectOnSuccess)
    },
  })

  const handleSubmit = (values: FormValues) => {
    if (!project) return
    submit({ project, reason: values.reason })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          form.reset()
          reset()
        }
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-[#1B1A17]">
            Перевести во «Вне контура MAG»?
          </DialogTitle>
          {project?.title ? <DialogDescription>Проект: {project.title}</DialogDescription> : null}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Причина перевода</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={TRIGGER_CLASS}>
                        <SelectValue placeholder="Выберите причину" />
                      </SelectTrigger>
                      <SelectContent>
                        {OUTSIDE_MAG_REASON_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isError && errorMessage ? (
              <p className="text-destructive text-sm">{errorMessage}</p>
            ) : null}
            <DialogFooter className="gap-2 sm:gap-2">
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
                type="submit"
                className="rounded-[10px] bg-black text-white hover:bg-black/90"
                disabled={isPending || !project}
              >
                Перевести
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
