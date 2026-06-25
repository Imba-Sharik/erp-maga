import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  PRE_PROJECT_STAGES,
  STAGE_LABELS,
  type PreprojectStage,
  type Project,
} from '@/entities/project'
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

import { getAllowedReturnStages } from '../lib/get-allowed-return-stages'
import { useReturnProjectFromOutsideMag } from '../model/use-return-project-from-outside-mag'

const TRIGGER_CLASS =
  'h-10 w-full rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC]'

const stageValues = [
  'plum_request',
  'primary_contact_done',
  'calculation_prepared',
  'contract_signed',
  'ready_to_event',
] as const satisfies readonly PreprojectStage[]

const formSchema = z.object({
  targetStage: z.enum(stageValues, { message: 'Выберите этап воронки' }),
})

type FormValues = z.infer<typeof formSchema>

export interface ReturnProjectFromOutsideMagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
}

export function ReturnProjectFromOutsideMagDialog({
  open,
  onOpenChange,
  project,
}: ReturnProjectFromOutsideMagDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {} as Partial<FormValues>,
  })

  const { submit, isPending, isError, errorMessage, reset } = useReturnProjectFromOutsideMag({
    onSuccess: () => {
      onOpenChange(false)
      form.reset()
      reset()
    },
  })

  const allowedStages = useMemo(
    () => getAllowedReturnStages(project?.lastActiveStage),
    [project?.lastActiveStage],
  )

  // Диалог всегда смонтирован — при смене проекта сбрасываем выбор и ошибку,
  // иначе выбранный ранее (теперь недоступный) этап остался бы в значении формы.
  useEffect(() => {
    form.reset()
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id])

  const handleSubmit = (values: FormValues) => {
    if (!project) return
    if (!allowedStages.includes(values.targetStage)) {
      form.setError('targetStage', { message: 'Этот этап недоступен для возврата' })
      return
    }
    submit({ project, targetStage: values.targetStage })
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
            Вернуть проект в воронку?
          </DialogTitle>
          {project?.title ? <DialogDescription>Проект: {project.title}</DialogDescription> : null}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="targetStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Этап предпроектной воронки</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={TRIGGER_CLASS}>
                        <SelectValue placeholder="Выберите этап" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRE_PROJECT_STAGES.map((stage) => (
                          <SelectItem
                            key={stage}
                            value={stage}
                            disabled={!allowedStages.includes(stage)}
                          >
                            {STAGE_LABELS[stage]}
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
                type="submit"
                className="rounded-[10px] bg-black text-white hover:bg-black/90"
                disabled={isPending || !project}
              >
                Вернуть
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
