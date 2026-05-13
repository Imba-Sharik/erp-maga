# ERP MAG

ERP-фронт на React 19 + TypeScript + Vite.

## Стек

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** + **shadcn/ui** (Slate, light/dark)
- **TanStack Query** + **kubb** — генерация типизированного API-клиента из OpenAPI
- **Zustand** — UI-state (не дублировать серверные данные!)
- **React Hook Form** + **Zod** — формы и валидация
- **React Router 7** (data router)
- **MSW** — моки до готовности бэка
- **Axios** — HTTP-клиент

## Архитектура

Feature-Sliced Design:

```
src/
├── app/          # провайдеры, роутер, точка входа
├── pages/        # страницы (роуты)
├── widgets/      # композитные блоки страниц
├── features/     # бизнес-фичи (создать заявку, оформить заказ)
├── entities/     # бизнес-сущности (User, Order, Product)
└── shared/
    ├── api/      # axios-клиент + сгенерированные kubb-хуки
    ├── ui/       # shadcn/ui-компоненты
    ├── lib/      # утилиты (cn и пр.)
    ├── hooks/
    └── config/   # env, константы
```

## Запуск

```bash
pnpm install
cp .env.example .env
pnpm dev
```

## Генерация API-клиента

После того как бэкендер пришлёт OpenAPI-схему из `drf-spectacular`:

```bash
# заменить openapi.yaml на реальную схему
curl http://localhost:8000/api/schema/ -o openapi.yaml

# сгенерировать клиент
pnpm api:generate
```

kubb сгенерирует в `src/shared/api/generated/`:
- TS-типы
- Zod-схемы
- Axios-клиенты по тегам
- React Query хуки

## Скрипты

| Команда                | Что делает                          |
| ---------------------- | ----------------------------------- |
| `pnpm dev`             | Запуск dev-сервера                  |
| `pnpm build`           | Прод-сборка                         |
| `pnpm preview`         | Превью прод-сборки                  |
| `pnpm lint`            | ESLint                              |
| `pnpm format`          | Prettier                            |
| `pnpm api:generate`    | Сгенерировать API-клиент из OpenAPI |

## Бэкенд

Django + DRF + **drf-spectacular**. Контракт API хранится в `openapi.yaml` (сейчас — заглушка).
