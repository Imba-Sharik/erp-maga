import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useManagersDirectory } from '@/entities/manager'
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

import { useChangeProjectManager } from '../model/use-change-project-manager'

const TRIGGER_CLASS =
  'h-10 w-full rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC]'

const formSchema = z.object({
  managerId: z.string().min(1, { message: 'Выберите менеджера' }),
})

type FormValues = z.infer<typeof formSchema>

export interface ChangeProjectManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectTitle?: string
  currentManager: string
}

export function ChangeProjectManagerDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  currentManager,
}: ChangeProjectManagerDialogProps) {
  const {
    selectOptions: managerOptions,
    isLoading: isManagersLoading,
    isError: isManagersError,
  } = useManagersDirectory()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {} as Partial<FormValues>,
  })

  const { submit, isPending, isError, errorMessage, reset } = useChangeProjectManager({
    onSuccess: () => {
      onOpenChange(false)
      form.reset()
      reset()
    },
  })

  const handleSubmit = (values: FormValues) => {
    submit({ projectId, managerId: values.managerId })
  }

  const selectDisabled = isManagersLoading || isManagersError

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
          <DialogTitle className="font-heading text-[#1B1A17]">Сменить менеджера</DialogTitle>
          {projectTitle ? (
            <DialogDescription>
              Проект: {projectTitle}
              {currentManager ? (
                <>
                  <br />
                  Текущий менеджер: {currentManager}
                </>
              ) : null}
            </DialogDescription>
          ) : currentManager ? (
            <DialogDescription>Текущий менеджер: {currentManager}</DialogDescription>
          ) : null}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="managerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Новый менеджер</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={selectDisabled}
                    >
                      <SelectTrigger className={TRIGGER_CLASS}>
                        <SelectValue placeholder="Выберите менеджера" />
                      </SelectTrigger>
                      <SelectContent>
                        {managerOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.fullName}
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
            {isManagersError ? (
              <p className="text-destructive text-sm">Не удалось загрузить список менеджеров</p>
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
                disabled={isPending || selectDisabled}
              >
                Сменить
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
