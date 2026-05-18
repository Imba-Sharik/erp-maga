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
