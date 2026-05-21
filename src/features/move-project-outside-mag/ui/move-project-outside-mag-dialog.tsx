import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
  projectId: string
  projectTitle?: string
}

export function MoveProjectOutsideMagDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
}: MoveProjectOutsideMagDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {} as Partial<FormValues>,
  })

  const { submit, isPending } = useMoveProjectOutsideMag({
    onSuccess: () => {
      onOpenChange(false)
      form.reset()
    },
  })

  const handleSubmit = (values: FormValues) => {
    submit({ projectId, reason: values.reason })
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
            Перевести во «Вне контура MAG»?
          </DialogTitle>
          {projectTitle ? <DialogDescription>Проект: {projectTitle}</DialogDescription> : null}
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
                Перевести
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
