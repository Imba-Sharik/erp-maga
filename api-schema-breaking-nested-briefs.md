# Breaking changes: вложенные brief-объекты в API

Документ для фронтенда. Описывает **только изменения контракта ответов** (JSON).  
**Тела запросов (формы, POST/PATCH)** в этом релизе **не менялись**.

Дата: 2026-06-04  
OpenAPI: после деплоя перегенерировать Kubb из актуальной схемы (`spectacular`).

---

## 1. Новые общие типы (components)

Появились переиспользуемые схемы:

### `UserBrief`

```json
{
  "id": 7,
  "full_name": "Иван Иванов"
}
```

`full_name` = `"first_name last_name".trim()` или `email`, если имя пустое.

### `MagManagerBrief`

```json
{
  "id": 5,
  "full_name": "Пётр Менеджеров",
  "email": "petr@example.com"
}
```

### `LoftBrief`

```json
{
  "id": 2,
  "plum_id": 20,
  "name": "Loft Центр"
}
```

### `HallBrief`

```json
{
  "id": 10,
  "plum_id": 100,
  "name": "Зал A"
}
```

---

## 2. Что **не** изменилось

### Запросы (формы)

| Метод | Endpoint | Тело |
|--------|----------|------|
| PATCH | `PATCH /api/v1/projects/{id}/` | `{ "mag_manager_id": <user_id> \| null }` |
| POST | `POST /api/v1/halls/hall-manager-assignments/` | `{ "hall": <int>, "loft": <int> \| null, "manager": <int> }` |
| PATCH/PUT | `PATCH/PUT .../hall-manager-assignments/{id}/` | то же (все поля опциональны на PATCH) |
| POST | `POST /api/v1/projects/` | без изменений (`hall_ids`, `event_type`, …) |
| Pipeline | contract, documents, sales, stage, … | без изменений |

### Query-параметры фильтров

- `?mag_manager=<user_id>` — по-прежнему id пользователя MAG  
- `?loft_id=`, `?hall_id=`, `?hall=`, `?loft=` — без изменений  

### Поля, которые остались как были

| Поле | Где | Примечание |
|------|-----|------------|
| `plum_mag_manager` | Project, ProjectDetail, list | строка из Plum, **не** объект |
| `halls[]` на проекте | Project, OutOfMag, calendar | плоско: `hall_id`, `hall_name`, `loft_id`, `loft_name` |
| `GET /api/v1/halls/lofts/` | Loft | полная сущность (`id`, `plum_id`, `name`, `synced_at`) |
| `updated_by` | HallManagerAssignment | **число** (id пользователя), не объект |

---

## 3. Изменения по сущностям и эндпоинтам

### 3.1. `Project` (список, карточка, ответ PATCH менеджера, создание проекта)

**Затронутые ответы:**

- `GET /api/v1/projects/`
- `GET /api/v1/projects/{id}/` (`ProjectDetail` — поле `mag_manager` такое же)
- `PATCH /api/v1/projects/{id}/` (ответ после смены менеджера)
- `POST /api/v1/projects/` (ответ 201)

#### Было

```json
{
  "mag_manager": "Пётр Менеджеров",
  "mag_manager_id": 5,
  "mag_manager_email": "petr@example.com"
}
```

(или `mag_manager: null`, `mag_manager_id: null`, `mag_manager_email` отсутствует / null)

#### Стало

```json
{
  "mag_manager": {
    "id": 5,
    "full_name": "Пётр Менеджеров",
    "email": "petr@example.com"
  }
}
```

или `"mag_manager": null`

#### Удалены из ответа

- `mag_manager_id`
- `mag_manager_email`

#### Не тронуто

- `plum_mag_manager` — строка из Plum  
- `halls[]` — см. раздел «не изменилось»

---

### 3.2. `ProjectDetail` — только `mag_manager`

Наследует `ProjectSerializer` для `mag_manager`. Остальные поля карточки (стадии, блоки, документы) **в этом PR не менялись**.

Поля вида `*_set_by`, `uploaded_by`, `confirmed_by` в audit/documents/detail уже были или остаются **`UserBrief`** (`{ id, full_name }`) — их форма не менялась в рамках этой задачи.

---

### 3.3. Календарь `GET /api/v1/projects/calendar/`

Элемент `results[]` (`ProjectCalendarItemSchema`).

#### Было

```json
{
  "mag_manager": "Иванов Иван",
  "mag_manager_id": 5
}
```

#### Стало

```json
{
  "mag_manager": {
    "id": 5,
    "full_name": "Иванов Иван",
    "email": "ivan@example.com"
  }
}
```

или `null`

#### Удалено

- `mag_manager_id`

`halls[]` в календаре — **без изменений** (плоские `hall_id`, `hall_name`, `loft_id`, `loft_name`).

---

### 3.4. `OutOfMagProject` — `GET /api/v1/projects/out-of-mag/`

Расширяет все поля `Project` + поля перевода.

#### Поле `out_of_mag_transferred_by`

**Было:** строка (ФИО или email)

```json
"out_of_mag_transferred_by": "Иван Иванов"
```

**Стало:** `UserBrief | null`

```json
"out_of_mag_transferred_by": {
  "id": 7,
  "full_name": "Иван Иванов"
}
```

#### Без изменений (верхний уровень)

- `stage_from` — string (код стадии)
- `out_of_mag_reason` — string
- `out_of_mag_transferred_at` — datetime
- все поля базового `Project`, включая новый `mag_manager` (см. §3.1)

Пагинация: `count`, `results[]` — как было (`InfinitePagination`).

---

### 3.5. `Hall` — `GET /api/v1/halls/halls/`

#### Было

```json
{
  "id": 10,
  "plum_id": 100,
  "name": "Зал A",
  "loft_id": 2,
  "loft_name": "Loft Центр",
  "synced_at": "..."
}
```

#### Стало

```json
{
  "id": 10,
  "plum_id": 100,
  "name": "Зал A",
  "loft": {
    "id": 2,
    "plum_id": 20,
    "name": "Loft Центр"
  },
  "synced_at": "..."
}
```

или `"loft": null`

#### Удалены

- `loft_id`
- `loft_name`

`GET /api/v1/halls/lofts/` — **без изменений**.

---

### 3.6. `HallManagerAssignment` — ответы GET/POST/PATCH

**Затронутые ответы:**

- `GET /api/v1/halls/hall-manager-assignments/`
- `GET /api/v1/halls/hall-manager-assignments/{id}/`
- `POST` / `PATCH` / `PUT` — **тело ответа** (201/200), не запрос

#### Запрос (без изменений)

OpenAPI: `HallManagerAssignmentWriteRequest` / `PatchedHallManagerAssignmentWriteRequest`

```json
{
  "hall": 10,
  "loft": 2,
  "manager": 5
}
```

`loft` может быть `null`. Поля — **integer PK**.

#### Ответ — было

```json
{
  "id": 1,
  "hall": 10,
  "loft": 2,
  "manager": 5,
  "hall_name": "Зал 1",
  "loft_name": "Loft A",
  "manager_full_name": "Иван Иванов",
  "manager_email": "ivan@example.com",
  "updated_by": 7,
  "created_at": "...",
  "updated_at": "..."
}
```

(в старой версии в ответе могли быть и PK, и дублирующие `*_name` / `*_email` — зависело от версии; сейчас **только** вложенные объекты + `updated_by` как id)

#### Ответ — стало

```json
{
  "id": 1,
  "hall": {
    "id": 10,
    "plum_id": 100,
    "name": "Зал 1"
  },
  "loft": {
    "id": 2,
    "plum_id": 20,
    "name": "Loft A"
  },
  "manager": {
    "id": 5,
    "full_name": "Иван Иванов",
    "email": "ivan@example.com"
  },
  "updated_by": 7,
  "created_at": "2026-01-01T12:00:00Z",
  "updated_at": "2026-01-01T12:00:00Z"
}
```

`loft` может быть `null`.

#### Удалены из ответа

- `hall_name`
- `loft_name`
- `manager_full_name`
- `manager_email`

В ответе **нет** голых `hall` / `loft` / `manager` как integer — только вложенные brief-объекты.

---

### 3.7. Каталог менеджеров `GET /api/v1/managers/`

Элемент `assignments[]` (`ManagerAssignment`).

#### Было

```json
{
  "id": 12,
  "hall_id": 10,
  "hall_name": "Зал 1",
  "loft_id": 2,
  "loft_name": "Loft A",
  "label": "Loft A — Зал 1"
}
```

#### Стало

```json
{
  "id": 12,
  "hall": {
    "id": 10,
    "plum_id": 100,
    "name": "Зал 1"
  },
  "loft": {
    "id": 2,
    "plum_id": 20,
    "name": "Loft A"
  },
  "label": "Loft A — Зал 1"
}
```

`loft` может быть `null`. Поле `label` — **без изменений**.

#### Удалены

- `hall_id`, `hall_name`
- `loft_id`, `loft_name`

Корень объекта менеджера (`id`, `email`, `full_name`, счётчики, суммы) — **без изменений**.

---

## 4. Сводная таблица (ответы)

| Схема / контекст | Поле | Было | Стало |
|------------------|------|------|--------|
| Project, ProjectDetail | `mag_manager` | `string \| null` | `MagManagerBrief \| null` |
| Project, ProjectDetail | `mag_manager_id` | `number \| null` | **удалено** |
| Project, ProjectDetail | `mag_manager_email` | `string` | **удалено** |
| ProjectCalendarItem | `mag_manager` | `string` | `MagManagerBrief \| null` |
| ProjectCalendarItem | `mag_manager_id` | `number \| null` | **удалено** |
| OutOfMagProject | `out_of_mag_transferred_by` | `string \| null` | `UserBrief \| null` |
| Hall | `loft_id`, `loft_name` | number, string | **удалены** |
| Hall | `loft` | — | `LoftBrief \| null` |
| HallManagerAssignment (response) | `hall`, `loft`, `manager` | number (+ опц. `*_name`, `*_email`) | `HallBrief`, `LoftBrief \| null`, `MagManagerBrief` |
| ManagerAssignment | `hall_id`, `hall_name`, `loft_id`, `loft_name` | плоские | **удалены** → `hall`, `loft` brief |

---

## 5. Чеклист для фронта

1. **Типы Kubb** — перегенерировать после обновления бэкенда.
2. **Список/карточка проекта** — читать `project.mag_manager?.id`, `?.full_name`, `?.email`; убрать обращения к `mag_manager_id` / `mag_manager_email` в **ответах**.
3. **PATCH менеджера** — по-прежнему отправлять `mag_manager_id`; в ответе парсить объект `mag_manager`.
4. **Календарь** — то же для `mag_manager`; убрать `mag_manager_id` из item.
5. **Out-of-mag** — `out_of_mag_transferred_by.id` / `.full_name` вместо строки.
6. **Справочник залов** — `hall.loft?.id` вместо `loft_id`; отображение имени из `hall.loft?.name`.
7. **Матрица назначений** — форма: PK как раньше; таблица/карточка после save: `row.hall.name`, `row.manager.email` и т.д.
8. **`GET /managers/`** — `assignment.hall`, `assignment.loft` вместо `hall_id` / `loft_name`.
9. **`plum_mag_manager`** — по-прежнему отдельная строка для Plum, не путать с `mag_manager`.

---

## 6. Примеры TypeScript (ориентир)

```ts
type UserBrief = { id: number; full_name: string };
type MagManagerBrief = { id: number; full_name: string; email: string };
type LoftBrief = { id: number; plum_id: number; name: string };
type HallBrief = { id: number; plum_id: number; name: string };

// Project (фрагмент)
type Project = {
  // ...
  mag_manager: MagManagerBrief | null;
  plum_mag_manager: string;
  halls: Array<{
    hall_id: number;
    hall_name: string;
    loft_id: number | null;
    loft_name: string;
  }>;
};

// PATCH request — без изменений
type ProjectMagManagerPatch = { mag_manager_id: number | null };
```

---

## 7. Эндпоинты: только ответ изменился / запрос тот же

| HTTP | Endpoint | Request | Response |
|------|----------|---------|----------|
| GET | `/api/v1/projects/` | — | изменён |
| GET | `/api/v1/projects/{id}/` | — | изменён |
| PATCH | `/api/v1/projects/{id}/` | **тот же** | изменён |
| POST | `/api/v1/projects/` | тот же | изменён |
| GET | `/api/v1/projects/calendar/` | — | изменён |
| GET | `/api/v1/projects/out-of-mag/` | — | изменён |
| GET | `/api/v1/halls/halls/` | — | изменён |
| GET/POST/PATCH | `/api/v1/halls/hall-manager-assignments/` | **тот же** | изменён |
| GET | `/api/v1/managers/` | — | изменён (`assignments[]`) |
| GET | `/api/v1/halls/lofts/` | — | без изменений |

---

Вопросы по контракту — к бэкенду; файл можно положить в репозиторий фронта или в wiki релиза.
