# API — этапы проекта

Проект уже создан бэком при синке с PLUM. На каждом этапе один запрос: «Следующий этап» одновременно сохраняет поля и двигает `stage`.

Общий эндпойнт: `POST /api/v1/projects/{id}/transitions/` — body всегда `{ "to_stage": "<следующий>", ...поля текущего этапа }`. В ответ — обновлённый `Project`.

## Этап 1 — `plum_request`

```json
{
  "to_stage": "primary_contact_done",
  "client_company": "...",   // required
  "phone": "...",            // required
  "contact_person": "...",   // required
  "email": "..."             // required
}
```

Системное (отдаётся в `GET /projects/{id}/`): `created_at`.

## Этап 2 — `primary_contact_done`

```json
{
  "to_stage": "calculation_prepared",
  "contact_comment": "...",                              // required, текст
  "contact_channel": "messenger" | "phone" | "meeting"   // required, enum
}
```

Системные (бэк выставляет сам при переходе **в** этот этап, отдаёт в `GET /projects/{id}/`):
- `contacted_at` — datetime входа в этап (= момент перехода с `plum_request`).
- `primary_contact_set_by` — пользователь, который выполнил переход (id + ФИО).

## Этап 3 — `calculation_prepared`

```json
{
  "to_stage": "contract_signed",
  "calculation_comment": "..."   // required, текст
}
```

Системные (выставляются при переходе **в** этот этап):
- `calculation_prepared_at` — datetime входа в этап.
- `calculation_prepared_set_by` — пользователь, выполнивший переход.

### Смета (файл) — ⚠️ требуется поддержка бэка

Менеджер обязан прикрепить файл сметы на этом этапе (обязательное действие перед переходом). Принимаем как закрывающие документы бухгалтера — отдельным файловым эндпойнтом, **не** в transition-body.

Нужно расширить enum `document_type` (эндпойнты `/api/v1/projects/{id}/documents/{document_type}/file/`, GET + POST) новым значением:

- `estimate` — смета.

После загрузки `GET /projects/{id}/` должен отдавать файл сметы в общем словаре `documents` (как `project_closing` / `subrent_closing` / `staff_receipts`): `{ file: { name, url, uploaded_at }, ... }`.

> Пока значения `estimate` на бэке нет, на фронте поле реализовано в демо-режиме: файл не загружается, в форме хранится только его имя (`StageEstimateField`). Когда enum добавят — компонент заменяется на `StageDocumentField` с `documentType="estimate"`, как у документов бухгалтера.

## Этап 4 — `contract_signed`

```json
{
  "to_stage": "ready_to_event",
  "contract_type": "with_vat" | "without_vat",   // required, enum
  "contract_number": "...",                      // required, текст
  "contract_date": "2026-05-11",                 // required, date (ISO yyyy-MM-dd)
  "legal_entity": "...",                         // required, текст
  "contract_comment": "..."                      // optional, текст
}
```

Системные (выставляются при переходе **в** этот этап):
- `contract_signed_at` — datetime входа в этап.
- `contract_signed_set_by` — пользователь, выполнивший переход.

## Этап 5 — `ready_to_event`

Финансовый блок. Менеджер заполняет `sales` по каждой статье. Плюс единый процент налога.

**Статьи (`kind`):**

| `kind`        | Лейбл (RU)   | В `main` | В `backline` |
|---------------|--------------|:--------:|:------------:|
| `equipment`   | Оборудование | ✅       | ✅           |
| `personnel`   | Персонал     | ✅       | ✅           |
| `sublease`    | Субаренда    | ✅       | ✅           |
| `transport`   | Транспорт    | ✅       | ✅           |
| `consumables` | Расходники   | ✅       | ✅           |
| `tm`          | ТМ           | ✅       | ✅           |
| `internet`    | Интернет     | ✅       | ❌           |
| `screen`      | Экран        | ✅       | ❌           |

```json
{
  "to_stage": "event_held",
  "tax_rate": 10,                       // required, число (%)
  "articles": [
    { "block": "main",     "kind": "equipment",   "sales": 1500000 },
    { "block": "main",     "kind": "personnel",   "sales": 350000  },
    { "block": "main",     "kind": "transport",   "sales": 120000  },
    { "block": "main",     "kind": "internet",    "sales": 0       },
    // незаполненные статьи можно либо отправить с sales: 0, либо не передавать вовсе
    { "block": "backline", "kind": "equipment",   "sales": 80000   }
    // ...
  ]
}
```

`block` — `"main"` или `"backline"`. `kind` — enum (см. таблицу выше). `sales` — число ≥ 0, **может быть 0** (для статей, которые менеджер не использовал). Список из 8 main-статей фиксированный, бэклайн опционален целиком (если менеджер не нажал «Добавить бэклайн» — `backline`-статей в массиве нет).

`bonus_percent` (колонка `%` справа от каждой суммы) на этом этапе не отправляется — это справочное значение из конфига статей; реально оно используется на этапе `bonus_calculated`.

Системные (вычисляются бэком, отдаются в `GET /projects/{id}/`):
- `sales_main_total` — `sum(articles where block='main', sales)`.
- `sales_backline_total` — `sum(articles where block='backline', sales)`.
- `sales_project_total` — `sales_main_total + sales_backline_total`.
- `tax_amount` — `sales_project_total * tax_rate / 100`.
- `ready_to_event_at` / `ready_to_event_set_by` — момент и автор перехода **в** этап.

## Этап 6 — `event_held`

Первый этап закрывающей воронки. Менеджер пишет краткий комментарий после мероприятия (опционально), остальное — системные поля.

```json
{
  "to_stage": "expenses_entered",
  "post_event_comment": "..."   // optional, текст
}
```

Системные (выставляются бэком, отдаются в `GET /projects/{id}/`):
- `event_held_at` — datetime входа в этап (= момент перехода с `ready_to_event`).
- `event_held_set_by` — пользователь, выполнивший переход.
- `event_date` — отображаем `event_date` самого проекта (синхронизируется из PLUM). Отдельного поля на этапе нет, у бэка ничего добавлять не нужно.
- `event_readiness` — `boolean` (`true` = «Был готов», `false` = «Не был готов»). На UI просто readonly-лейбл, менеджер не редактирует. Выставляется бэком автоматически: при штатном переходе с `ready_to_event` в `event_held` = `true`.

## Этап 7 — `expenses_entered`

Второй финансовый блок. Менеджер заполняет `expense` по тем же статьям, что и на этапе 5 (`main` — 8 статей, `backline` — 6, см. таблицу из этапа 5). Плюс опциональный комментарий к расходам.

`tax_rate` уже задан на этапе 5 — повторно не отправляется. Бэклайн уже добавлен/не добавлен на этапе 5, в этом этапе менеджер только проставляет суммы расходов; список статей не меняется.

```json
{
  "to_stage": "documents_confirmed",
  "expenses_comment": "...",            // optional, текст
  "articles": [
    { "block": "main",     "kind": "equipment",   "expense": 800000 },
    { "block": "main",     "kind": "personnel",   "expense": 200000 },
    { "block": "main",     "kind": "transport",   "expense": 60000  },
    { "block": "main",     "kind": "internet",    "expense": 0       },
    // незаполненные статьи можно либо отправить с expense: 0, либо не передавать вовсе
    { "block": "backline", "kind": "equipment",   "expense": 40000   }
    // ...
  ]
}
```

`block` — `"main"` или `"backline"`. `kind` — enum (см. таблицу в этапе 5). `expense` — число ≥ 0, **может быть 0** (для статей без расходов). Набор статей фиксированный (как и на этапе 5), новых заводить не нужно.

`sales` и `bonus_percent` на этом этапе не отправляются — они уже сохранены ранее.

Системные (вычисляются бэком, отдаются в `GET /projects/{id}/`):
- `expenses_main_total` — `sum(articles where block='main', expense)`.
- `expenses_backline_total` — `sum(articles where block='backline', expense)`.
- `expenses_project_total` — `expenses_main_total + expenses_backline_total`.
- `expenses_entered_at` / `expenses_entered_set_by` — момент и автор перехода **в** этап.

## Этап 8 — `documents_confirmed`

Этап бухгалтера (доступ только у роли `accountant`). Проверяются три категории закрывающих документов; по каждой бухгалтер выставляет статус.

```json
{
  "to_stage": "feedback_received",
  "project_docs_status":   "present" | "absent" | "not_required",   // required, enum
  "sublease_docs_status":  "present" | "absent" | "not_required",   // required, enum
  "staff_receipts_status": "present" | "absent" | "not_required"    // required, enum
}
```

`enum`-значения:
- `"present"` — «Есть» (документ получен).
- `"absent"` — «Нет» (отсутствует, нужно догнать).
- `"not_required"` — «Не требуется» (для этого проекта эта категория неприменима).

Системные (выставляются бэком при изменении каждого статуса; отдаются в `GET /projects/{id}/`):
- `project_docs_confirmed_at` / `project_docs_confirmed_by` — момент и автор последней смены `project_docs_status`.
- `sublease_docs_confirmed_at` / `sublease_docs_confirmed_by` — то же для субаренды.
- `staff_receipts_confirmed_at` / `staff_receipts_confirmed_by` — то же для расписок по персоналу.
- `documents_confirmed_at` / `documents_confirmed_set_by` — момент и автор перехода **в** этап (с `expenses_entered`).

> Желательно фиксировать `*_confirmed_at`/`*_confirmed_by` на каждое отдельное изменение статуса, а не только в момент финального перехода — чтобы был аудит, кто и когда подтвердил каждый блок документов.

## Этап 9 — `data_confirmed`

Этап руководителя (роль `director`). Подтверждает, что все данные по проекту корректны. На фронте — один селект и два авто-заполняемых поля справа.

```json
{
  "to_stage": "bonus_calculated",
  "data_confirmed_status": "confirmed" | "rejected"   // required, enum
}
```

`enum`-значения:
- `"confirmed"` — «Данные подтверждены».
- `"rejected"` — «Не приняты» (направляет проект обратно — пока на бэке не реализован откат, в UI просто статус).

Системные (выставляются бэком в момент изменения `data_confirmed_status`, отдаются в `GET /projects/{id}/`):
- `data_confirmation_at` — datetime, когда руководитель выставил/изменил статус.
- `data_confirmation_by` — пользователь, выставивший статус (id + ФИО).
- `data_confirmed_at` / `data_confirmed_set_by` — момент и автор перехода **в** этап.

> Как и для `documents_confirmed`, `data_confirmation_at`/`by` — это per-row штамп (обновляется на каждое изменение статуса), а `data_confirmed_at`/`set_by` — мета транзишена. Имена разделены, чтобы не было коллизии.

## Этап 10 — `bonus_calculated`

Чисто вычислительный этап (роль `director`). Менеджер ничего не вводит руками — выводятся данные с предыдущих этапов и расчёт по формуле. Руководитель **может** скорректировать «Бонус по статье» (`bonus_amount`) по любой строке — это override формульного значения.

Откуда берутся колонки UI (для контекста — на бэк ничего нового не отправляется, кроме overrides):

| Колонка | Источник |
|---|---|
| `sales` | `articles[block][kind].sales` (с этапа 5) |
| `expense` | `articles[block][kind].expense` (с этапа 7) |
| `net_profit` | вычисляется: `sales − expense` |
| `% Бонуса` | `articles[block][kind].bonus_percent` (из конфига; пока статика на фронте — см. `entities/project-articles/lib/defaults.ts`) |
| `Бонус по статье` | по умолчанию `net_profit × bonus_percent / 100`; при override руководителя — присланное значение |
| «Данные подтверждены руководителем» | `data_confirmation_by` из этапа 9 |

### Запрос

```json
{
  "to_stage": "bonus_approved",
  "articles": [
    // Передаём только те статьи, по которым руководитель переопределил бонус.
    // Если массив пустой — все бонусы считаются по формуле.
    { "block": "main",     "kind": "equipment", "bonus_amount": 50000 },
    { "block": "backline", "kind": "transport", "bonus_amount": 0     }
  ]
}
```

`bonus_amount` — число ≥ 0. **Может быть 0** (явное обнуление). Чтобы «вернуть формулу» по статье — не передавайте её в массиве (если же надо явно сбросить override на бэке — TBD: либо отправлять `null`, либо отдельный эндпойнт; пока договоримся, что без статьи в массиве = формула).

`bonus_percent` руками тут не меняется (только админ через конфиг).

### Системные (вычисляются бэком, отдаются в `GET /projects/{id}/`)

- `net_profit_total` — `sum(articles, sales − expense)`.
- `bonus_calculated_total` — `sum(articles, bonus_amount || формула)` (то же, что показывается в «Итоговый бонус»).
- `bonus_calculated_at` / `bonus_calculated_set_by` — момент и автор перехода **в** этот этап.

## Этап 11 — `bonus_approved`

Этап руководителя (роль `director`) — финальное утверждение рассчитанного бонуса. На UI всё readonly: «Итоговый бонус», «Дата подтверждения», «Кто подтвердил». Менеджер ничего не редактирует — клик «Следующий этап» = «утверждаю».

### Запрос

```json
{
  "to_stage": "closed"
}
```

Тело пустое (кроме `to_stage`). Если потребуется возможность скорректировать сумму на этапе утверждения — добавим `bonus_approved_total: number` сюда (TBD, см. вопросы внизу).

### Системные (вычисляются бэком, отдаются в `GET /projects/{id}/`)

- `bonus_approved_total` — копия `bonus_calculated_total` с этапа 10 (если не переопределяется руководителем).
- `bonus_approved_at` — datetime входа в этап (= момент клика «Следующий этап» на этапе 10).
- `bonus_approved_by` — пользователь, выполнивший утверждение (id + ФИО, обычно директор).

### Вопрос продакту

Может ли директор на этом этапе **скорректировать** `bonus_approved_total`, или это исключительно «утвердить как рассчитано»? Если может — добавим поле в запрос и сделаем «Итоговый бонус» редактируемым на UI.

## Этап 12 — `closed`

**Терминальный этап.** Из него нет перехода — нет кнопки «Следующий этап», ничего отправлять не нужно. Проект попадает сюда с этапа 11 (см. `to_stage: "closed"` в запросе этапа 11).

На UI всё readonly: «Дата закрытия» и «Ведущий менеджер».

### Системные (отдаются в `GET /projects/{id}/`)

- `closed_at` — datetime входа в этап (= момент клика «Следующий этап» на этапе 11). Выставляется бэком автоматически.
- `closed_by` — пользователь, выполнивший закрытие (id + ФИО). Сейчас на UI не показывается, но в БД сохранить стоит — пригодится для аудита.
- `mag_manager` (первая запись через запятую) — отображается как **«Ведущий менеджер»**. Источник — PLUM через `Project.mag_manager`, фронт берёт первого; новых полей заводить не нужно.
