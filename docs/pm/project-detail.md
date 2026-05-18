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
  clientCompany?: string
  phone?: string
  email?: string
  contactPerson?: string
  createdAt?: string
  // first_contact
  contactComment?: string
  contactChannel?: 'messenger' | 'phone' | 'meeting'
  contactedAt?: string
  // calc_ready
  calcComment?: string
  // signed
  contractType?: 'with_vat' | 'without_vat'
  contractNumber?: string
  contractDate?: string
  legalEntity?: string
  contractComment?: string
  // event_held, expenses_entered, documents_confirmed, data_confirmed,
  // bonus_calculated, bonus_approved, closed — см. fields-map.ts
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

## Машина состояний воронки — `useStageFlow`

Источник правды для «какой этап текущий», истории переходов и финансовых статей — хук [features/advance-stage/model/use-stage-flow.ts](../../src/features/advance-stage/model/use-stage-flow.ts).

```ts
const flow = useStageFlow({ initialStage: project.stage, projectEnteredAt: project.enteredSystemAt })
// flow.currentStage, flow.visibleStages, flow.getRecord(stage), flow.advance(values?)
// flow.articles, flow.taxRate, flow.updateArticle, flow.setTaxRate, flow.toggleBackline
```

Состояние **локальное** (`useState`), пока бэк не реализует `POST /projects/{id}/transitions/` ([docs/api/stages.md](../api/stages.md)). После kubb-генерации `advance` подменяется на мутацию — потребители (`ProjectDetailStages`, секции этапов) не трогаются.

Хранит:
- `currentStage` — текущий этап. Стартует с `project.stage`, продвигается на `advance()`.
- `records: Partial<Record<ProjectStage, StageRecord>>` — на каждый пройденный/текущий этап: `enteredAt`, `enteredBy`, `completedAt`, `completedBy`, `values` (значения формы). Для `plum_request` initial-запись: `enteredAt = project.enteredSystemAt`, `enteredBy = 'PLUM (синхронизация)'`. На `advance` — закрываем текущий этап (`completedAt = now`, `completedBy = useCurrentUser().fullName`), открываем следующий (`enteredAt = now`, `enteredBy = ...`).
- `articles: ProjectArticles` (из [entities/project-articles](../../src/entities/project-articles)) — `{ main: Record<ArticleKind, { sales, expense, bonusPercent }>, backline: ... | null }`. Используется на финансовых этапах `ready_to_event`, `expenses_entered`, `bonus_calculated` (разные `aspect` редактируются на разных этапах). Дефолтные `bonusPercent` — в [defaults.ts](../../src/entities/project-articles/lib/defaults.ts), легко менять.
- `taxRate` — единый процент налога (этап 5).

## Текущий пользователь — `useCurrentUser`

Заглушка под JWT/`/users/me` — [entities/current-user](../../src/entities/current-user). Возвращает `{ id, fullName, displayName, initials, email, role }` на основе выбранной роли в дропдауне сайдбара. Имена-заглушки в `STUB_USERS` (manager → «Шарин Игорь Дмитриевич», accountant → «Петрова Анна Сергеевна», director → «Сидоров Сергей Сергеевич»). Используется в:
- Сайдбаре (`AppSidebar`) — аватар/имя/инициалы реактивны к роли.
- `useStageFlow.advance` — стамп `enteredBy` / `completedBy` при переходе.

## Форма текущего этапа

`StageSectionCurrent` рендерит RHF-форму на основе [stage-form-schemas.ts](../../src/entities/project/lib/stage-form-schemas.ts). Системные поля (`leadManager`, `contactedAt`, `closingFunnelEnteredAt`) в схему **не входят** — они выставляются автоматически бэком (а до подключения бэка — резолвятся из `flow.getRecord(stage)` через [resolve-system-value.ts](../../src/widgets/project-stage-section/lib/resolve-system-value.ts)).

Текущие schemas:
- `plum_request` — `clientCompany`, `phone`, `contactPerson`, `email` все `required()`; `createdAt` optional.
- `first_contact` — `contactComment: required()`, `contactChannel: enum([messenger|phone|meeting])` с русским сообщением об ошибке.
- `calc_ready` — `calcComment: required()`.
- `signed` — `contractType: enum([with_vat|without_vat])` с русским сообщением, `contractNumber`, `contractDate`, `legalEntity: required()`, `contractComment: optional()`.
- `ready` — пустая схема (форма не нужна, всё через `useStageFlow.articles`).

CTA «Следующий этап» → `form.handleSubmit((values) => flow.advance(values))`. На `signed` кнопка получает лейбл «Готов к проведению» (то же действие). Реальный API будет описан в [docs/api/stages.md](../api/stages.md), сейчас всё локально.

### Layout: «Информация» как футер

`partitionFields(stage, fields)` ([partition-fields.ts](../../src/widgets/project-stage-section/lib/partition-fields.ts)) делит поля этапа на `main` (заполняет менеджер) и `meta` (системные `leadManager`/`contactedAt`/`closingFunnelEnteredAt`). `main` идёт в основную 3-колоночную сетку, `meta` — в отдельную секцию **«Информация»** с тем же сабхедером, что и на этапе 5. На `bonus_calculated`/`closed` секция «Информация» не отделяется — там `leadManager` означает «получатель/ведущий менеджер проекта», не транзишен.

### Дата (`type: 'date'`)

Manager-поля типа `date` (например, `contractDate` на `signed`) рендерятся через [StageDateField](../../src/widgets/project-stage-section/ui/stage-date-field.tsx) — Popover + shadcn Calendar (`react-day-picker`, `date-fns`). Хранит ISO `yyyy-MM-dd`, отображает `dd.MM.yyyy`.

## Пройденные этапы

`StageSectionPassed` — collapsible (раскрыт по умолчанию). Все поля (и manager, и system) **рендерятся в системном стиле** (dashed `#C7C7C7`, bg `#F4F2EC`) — пройденный этап «заморожен» полностью. Значения тянутся из `flow.getRecord(stage).values`, системные — через `resolveSystemValue` с приоритетом `record` → `project` → `mockValue`. Layout — тот же `main` + «Информация», что и в текущем виде (см. выше).

`PASSED_EXTRAS` (в `fields-map.ts`) — устаревший механизм для «системных хвостов» (Статус перевёл менеджер / Дата перехода в статус). Поэтапно мигрируется: `calc_ready` и `signed` уже переведены на `STAGE_FIELDS` с `source: 'system'` (читается из `record`).

### Кастомные секции — финансовые блоки

`ready_to_event`, `expenses_entered`, `bonus_calculated` рендерятся не через generic-механизм, а через [FinanceBlockWithBackline](../../src/widgets/project-stage-section/ui/finance-block-with-backline.tsx) (data-driven компонент, тонкие обёртки `StagePassedReady`/`StagePassedExpenses` задают разный `aspect`):

| Этап                | Компонент           | `aspect`         |
| ------------------- | ------------------- | ---------------- |
| `ready_to_event`    | `StagePassedReady`  | `'sales'`        |
| `expenses_entered`  | `StagePassedExpenses` | `'expense'`    |
| `bonus_calculated`  | `StagePassedBonus`  | — (свой UI)      |

Принимают `articles`, `taxRate`, `onArticleChange`, `onToggleBackline`, `onTaxRateChange`, `record`, `isCurrent` из `useStageFlow` (через `ProjectStageSection` → `ProjectDetailStages`). `MoneyInput`/`PercentInput` — живое форматирование (пробелы каждые 3 цифры + `₽`/`%`, фильтрация по `inputMode`). Проценты в колонке справа — `bonusPercent` из дефолтов (на этапе 5 read-only, на 11 будут редактируемы). Итоги, сумма налога — calculated. Кнопки «Добавить/Удалить бэклайн» видны только при `editable = canEdit && isCurrent`.

### Поля с `narrow: true`

Если два подряд field-конфига имеют `narrow: true`, рендерер (и в `StageSectionCurrent`, и в `StageSectionPassed`) объединяет их в один grid-cell с внутренней `grid-cols-2`. Используется на `signed`, чтобы «Номер договора» + «Дата договора» занимали одну ячейку.

## Права редактирования по ролям

Источник — [src/widgets/project-stage-section/lib/stage-permissions.ts](../../src/widgets/project-stage-section/lib/stage-permissions.ts). Подробнее в [CLAUDE.md](../../CLAUDE.md), раздел «Права по этапам».

Реализация:
1. `useUserRole()` из `@/entities/user-role` отдаёт текущую роль (выбирается в дропдауне профиля сайдбара).
2. `canEditStage(stage, role)` возвращает `boolean`.
3. В каждой stage-секции (current, passed, custom-passed) при `!canEdit`:
   - manager-поля принудительно рендерятся как `system`
   - CTA-кнопки убираются из DOM (а не disabled — чтобы их вовсе не было видно)

Демонстрация: в дропдауне профиля переключай радио «Войти как (dev)» — Менеджер / Бухгалтер / Руководитель. Выбор сохраняется в `localStorage` (`erp-maga:user-role`).

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

## Звёздочки `*` для обязательных полей

`StageFieldShell` принимает `required?: boolean` и рендерит звёздочку красным `#D25252` (см. также `FormLabel` в `StageSectionCurrent`). Для passed-секций флаг прокидывается через `StageFieldDemoEditable` (читает `field.required`). В кастомных компонентах (`ready`/`expenses_entered`/`bonus_calculated`) `ArticleField` по дефолту `required: true`, `SimpleField` — нет.

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
