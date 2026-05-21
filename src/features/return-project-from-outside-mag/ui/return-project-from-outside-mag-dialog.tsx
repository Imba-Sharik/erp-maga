import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { PRE_PROJECT_STAGES, STAGE_LABELS, type PreprojectStage } from '@/entities/project'
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
  projectId: string
  projectTitle?: string
}

export function ReturnProjectFromOutsideMagDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
}: ReturnProjectFromOutsideMagDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {} as Partial<FormValues>,
  })

  const { submit, isPending } = useReturnProjectFromOutsideMag({
    onSuccess: () => {
      onOpenChange(false)
      form.reset()
    },
  })

  const handleSubmit = (values: FormValues) => {
    submit({ projectId, targetStage: values.targetStage })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) form.reset()
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-[#1B1A17]">
            Вернуть проект в воронку?
          </DialogTitle>
          {projectTitle ? <DialogDescription>Проект: {projectTitle}</DialogDescription> : null}
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
                          <SelectItem key={stage} value={stage}>
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
                disabled={isPending}
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
