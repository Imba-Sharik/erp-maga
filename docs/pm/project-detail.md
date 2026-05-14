# `/projects/:id` — карточка проекта

Детальная страница проекта: воронка по этапам, форма текущего этапа, история пройденных этапов, сводная информация из PLUM и финансы. Соответствует Figma-фрейму `Источник — /projects/[id] / ProjectDetail` (page `2510:2`, frame `2534:2`).

## Маршрут

```
/projects/:id   →   ProjectDetailPage
```

Регистрация в [src/app/router.tsx](../../src/app/router.tsx) рядом с `/projects`:

```tsx
{ path: 'projects', element: <ProjectsPage /> },
{ path: 'projects/:id', element: <ProjectDetailPage /> },
```

Параметр `:id` — это `Project['id']` вида `P-2026-0142`. С API он читается через `useParams<{ id: string }>()`.

## Семантическая структура (Figma → код)

```
ProjectDetail (root)
└── AppLayout (общая обёртка)
    ├── Sidebar — widgets/app-sidebar (уже есть)
    └── Main
        ├── Topbar (с breadcrumb-слотом)
        │   ├── Breadcrumb «Все проекты / P-2026-0142»
        │   └── Date + Bell
        ├── Divider
        └── PageContent
            └── DetailLayout (CSS grid 1fr 405px, gap 20)
                ├── LeftStack
                │   ├── MainCard          (карточка с ProjectHeader)
                │   ├── TabsRow
                │   └── StageSection[]    (1 current + N passed)
                └── Aside
                    ├── Card/Данные из PLUM
                    ├── Card/Данные Клиента
                    ├── Card/Комментарий из PLUM
                    └── Card/Финансы (сводка)
```

Имена слоёв в Figma 1-в-1 = имена React-компонентов (PascalCase, `/` → подкомпонент).

## Раскладка по слоям FSD

```
src/
├── pages/
│   └── project-detail/
│       ├── index.ts                       # export { ProjectDetailPage }
│       └── ui/project-detail-page.tsx     # роут-компонент, читает :id, рендерит widgets
├── widgets/
│   ├── project-detail/                    # 2-колоночный layout
│   │   ├── index.ts
│   │   └── ui/
│   │       ├── project-detail.tsx         # DetailLayout
│   │       ├── project-detail-main.tsx    # LeftStack (MainCard + Tabs + Stages)
│   │       └── project-detail-aside.tsx   # Aside (4 карточки)
│   ├── project-stage-section/             # одна секция этапа (current | passed)
│   │   ├── index.ts
│   │   ├── lib/fields-map.ts              # описание полей для каждого ProjectStage
│   │   └── ui/
│   │       ├── project-stage-section.tsx
│   │       ├── stage-section-current.tsx  # current: editable, с CTA
│   │       └── stage-section-passed.tsx   # passed: collapsible, read-only
│   └── project-topbar-breadcrumb/         # тонкая обёртка для слота в AppLayout topbar
│       └── ui/project-topbar-breadcrumb.tsx
├── features/
│   ├── project-stage-transition/          # «Следующий этап» / «Готов к проведению»
│   │   ├── api/                           # mutations поверх kubb
│   │   ├── model/                         # zustand или RHF state
│   │   └── ui/stage-cta-buttons.tsx
│   ├── project-tabs/                      # переключение табов (URL ?tab=...)
│   │   └── ui/project-tabs.tsx            # TabsRow
│   └── project-plum-sync/                 # ссылка «Карточка в PLUM», статус синка
│       └── ui/plum-link.tsx
└── entities/
    └── project/                           # ↑ существует, расширяется
        ├── model/
        │   ├── types.ts                   # +StageHistoryEntry, +StageFormData
        │   └── mock.ts                    # +mock пройденных этапов
        ├── lib/
        │   └── stages.ts                  # ↑ +STAGE_FORM_SCHEMA по этапам
        └── ui/
            ├── project-header.tsx         # NEW — title + StageBadge + meta + PlumLink
            ├── project-aside-card.tsx     # NEW — обёртка карточки aside
            └── project-stage-badge.tsx    # NEW — overload поверх ProjectStatusBadge
```

**Правило импортов FSD:** `pages → widgets → features → entities → shared`. Обратные импорты запрещены.

## Расширение модели `entities/project`

Существующий `Project` остаётся, но нужны два новых типа.

```ts
// entities/project/model/types.ts
export interface StageHistoryEntry {
  stage: ProjectStage
  enteredAt: string          // ISO дата перехода в этап
  managerName: string        // кто перевёл
  comment?: string
  // поля специфичные для этапа — берутся из StageFormData
  data: Partial<StageFormData>
}

export interface StageFormData {
  // plum_request
  client?: string
  phone?: string
  email?: string
  contactPerson?: string
  createdAt?: string
  // first_contact
  contactComment?: string
  contactChannel?: 'messenger' | 'phone' | 'email' | 'meeting'
  contactedAt?: string
  // calc_ready
  calcComment?: string
  // signed
  contractType?: 'with_vat' | 'without_vat'
  contractNumber?: string
  contractDate?: string
  legalEntity?: string
  contractComment?: string
}

export interface ProjectDetail extends Project {
  enteredSystemAt: string    // «Заведено в систему: 11 мая 2026, 10:08»
  history: StageHistoryEntry[]
  // PLUM
  plumId: string             // 'PL-89432'
  plumStatus: 'pending' | 'confirmed'
  plumComment?: string
  plumSyncedAt?: string
  // Клиент
  clientCompany?: string
  clientStatus: 'pending' | 'confirmed'
  // Финансы — на этапе MVP только sales, остальное null
  finance: {
    sales: number | null
    expenses: number | null
    bonuses: number | null
    netProfit: number | null
  }
}
```

## Данные

Источник: `GET /api/projects/{id}/` (Django DRF). Контракт описан в [openapi.yaml](../../openapi.yaml), клиент и React Query хуки генерятся через kubb (`pnpm api:generate`).

```tsx
// pages/project-detail/ui/project-detail-page.tsx
const { id } = useParams<{ id: string }>()
const { data, isLoading, error } = useProjectsRetrieve(id!)  // kubb-хук
```

**Не хранить ответ в Zustand** — TanStack Query уже кэширует. Локальный UI-стейт (открыт ли passed-этап, активный таб) — в URL (`?tab=data&stage=signed`) или в локальном `useState`.

## Tabs

Четыре таба, активный — `Данные о проекте`:

| Tab key      | Содержимое                                  | MVP? |
| ------------ | ------------------------------------------- | ---- |
| `data`       | LeftStack со StageSection-ами               | ✅    |
| `economics`  | Расчёт по позициям, P&L                     | ❌    |
| `documents`  | Файлы: договор, смета, акты                 | ❌    |
| `actions`    | Аудит-лог (кто, что, когда)                 | ❌    |

В MVP — заглушки для трёх вкладок (`Coming soon`).

Состояние таба — query-параметр `?tab=`. Это даёт shareable URL и сохранение между ререндерами.

## Форма текущего этапа

`StageSectionCurrent` рендерит RHF-форму, схема которой зависит от `project.stage`. Конфиг полей — в `widgets/project-stage-section/lib/fields-map.ts`:

```ts
import { z } from 'zod'

export const STAGE_FORM_SCHEMAS = {
  plum_request:   z.object({...}),
  first_contact:  z.object({ contactComment: z.string().min(1), contactChannel: z.enum([...]), contactedAt: z.string() }),
  calc_ready:     z.object({ calcComment: z.string().min(1) }),
  signed:         z.object({ contractType: z.enum(['with_vat','without_vat']), contractNumber: z.string().min(1), contractDate: z.string(), legalEntity: z.string().min(1), contractComment: z.string().optional() }),
  ready:          z.object({}),
} satisfies Record<ProjectStage, z.ZodSchema>
```

CTA-кнопки:

- **Следующий этап** — `POST /api/projects/{id}/advance-stage/` с телом формы. Перемещает проект на следующий этап в `STAGE_ORDER`.
- **Готов к проведению** — `POST /api/projects/{id}/mark-ready/`. Доступна только на этапе `signed` и переводит в `ready` (терминальный для воронки продаж).

Обе мутации — в `features/project-stage-transition/api/`, инвалидируют `projectsRetrieve(id)` и `projectsList()`.

## Пройденные этапы

`StageSectionPassed` — read-only, collapsible. Поля показываются `disabled` (бежевый фон `--field-bg`), значения берутся из `project.history.find(h => h.stage === stage).data`.

В MVP — раскрыты все по умолчанию (как в Figma). Collapse — в следующих итерациях.

## Aside-карточки

Все 4 карточки — read-only снимки. Источник:

| Карточка             | Поля проекта                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------- |
| **Данные из PLUM**   | `plumId`, `plumStatus`, `type`, `date`, `loft`, `hall`, `city`                              |
| **Данные Клиента**   | `clientCompany`, `manager` (контактное лицо), `phone`, `email`, бейдж `clientStatus`        |
| **Комментарий из PLUM** | `plumComment`, `plumSyncedAt`                                                            |
| **Финансы (сводка)** | `finance.sales`, `finance.expenses`, `finance.bonuses`, `finance.netProfit`                 |

Общий компонент-обёртка — `entities/project/ui/project-aside-card.tsx` с пропсами `title`, `badge?`, `subline?`, `children`. Внутри — список `KvRow` (label / value через `justify-between`).

## Адаптив

Container queries для `DetailLayout`:

- `@container (min-width: 1200px)` → grid `1fr 405px`
- `@container (max-width: 1199px)` → grid `1fr` (Aside переезжает под LeftStack)

Внутри StageSection — `grid-cols-3` на десктопе, `grid-cols-1` на узких контейнерах. `@container` поверх viewport, потому что свёрнутый сайдбар меняет ширину контента (см. `feedback_container_queries`).

## Топбар и breadcrumb

В [src/app/layouts/app-layout.tsx](../../src/app/layouts/app-layout.tsx) Topbar — общий для всех страниц. Чтобы добавить Breadcrumb слева, нужен слот:

```tsx
<AppLayout breadcrumb={<Breadcrumb backTo="/projects" current="P-2026-0142" />}>
  ...
</AppLayout>
```

Либо — через `Outlet context` / отдельный `useTopbarSlot()` хук. Решение — в момент имплементации, конвенция фиксируется в [src/app/layouts/app-layout.tsx](../../src/app/layouts/app-layout.tsx).

## Состояния

| Состояние   | UI                                                                                           |
| ----------- | -------------------------------------------------------------------------------------------- |
| `loading`   | Skeleton всех блоков (Breadcrumb, MainCard, Stages, Aside). Использовать `shadcn/skeleton`.  |
| `error`     | Inline error card в LeftStack + кнопка «Повторить». Сайдбар и Topbar остаются интерактивными. |
| `not_found` | Редирект на `/projects` + toast.                                                              |
| `forbidden` | Карточка «Нет доступа» (для будущих ролей).                                                  |

## Что есть и чего не хватает

**Готово:**
- ✅ Figma-фрейм `ProjectDetail` со всеми блоками
- ✅ Базовые типы `Project`, `ProjectStage`, `STAGE_ORDER`, `STAGE_LABELS` в `entities/project`
- ✅ Компоненты-кирпичи: `ProjectStatusBadge`, `ProjectCard`

**Нужно для MVP детальной страницы:**
- ⏳ Расширить `Project` → `ProjectDetail` с `history`, `plumId`, `finance`
- ⏳ Добавить `STAGE_FORM_SCHEMAS` (zod)
- ⏳ Slot в `AppLayout` для Breadcrumb
- ⏳ `widgets/project-detail` + `widgets/project-stage-section`
- ⏳ `features/project-stage-transition` (mutations)
- ⏳ Маршрут `/projects/:id` в роутере
- ⏳ Mock-данные истории этапов в `entities/project/model/mock.ts`
- ⏳ Сгенерировать kubb по обновлённому OpenAPI (когда бэк подтянет endpoint)

## Ссылки

- Figma: [Источник — /projects/[id]](https://www.figma.com/design/HAj8LlmGcKz3fN9NOVqUSX/ERP-MAG2?node-id=2534-2)
- Старый PM-пример: [node 2480:2](https://www.figma.com/design/HAj8LlmGcKz3fN9NOVqUSX/ERP-MAG2?node-id=2480-2)
- Соседний Code sync для kanban: [node 2474:2](https://www.figma.com/design/HAj8LlmGcKz3fN9NOVqUSX/ERP-MAG2?node-id=2474-2)
- Конвенции именования слоёв: [docs/pm/figma-handoff.md](./figma-handoff.md) *(если/когда появится)*
