import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'

import { useLogin } from '../model/use-login'

const loginSchema = z.object({
  email: z.email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const FIELD_CLASS =
  'h-11 rounded-[10px] border-border-medium bg-white placeholder:text-muted-foreground'

export function LoginForm() {
  const { login, isPending, isError } = useLogin()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-foreground text-xl font-bold">Авторизация</h1>
        <p className="text-muted-foreground text-sm">Введите ваш email и пароль</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(login)} className="flex flex-col gap-4" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Email"
                    autoComplete="username"
                    className={FIELD_CLASS}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Пароль"
                    autoComplete="current-password"
                    className={FIELD_CLASS}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isError ? (
            <p className="text-destructive text-sm" role="alert">
              Неверный логин или пароль
            </p>
          ) : null}

          <Button
            type="submit"
            className="h-11 w-full rounded-[10px] bg-black text-white hover:bg-black/90"
            disabled={isPending}
          >
            {isPending ? 'Вход…' : 'Войти'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
