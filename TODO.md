# Страница календаря проектов

Ветка: `feat/calendar`. Дизайн: Figma node `2451:331` / структурный `2457:2`.

## Setup

- [x] Создать ветку `feat/calendar` от `main`
- [x] Заглушки страниц `/dashboard`, `/calendar`, `/closing`, `/notifications`
- [x] Добавить пункты в `AppSidebar`
- [x] Установить shadcn: `card`, `badge`, `select`
- [x] Добавить в `badge.tsx` варианты `success` / `info` / `warning` / `counter`
- [x] Установить `date-fns`

## entities/project

- [ ] `model/types.ts` — `Project`, `ProjectStatus = 'confirmed' | 'signed' | 'expenses'`
- [ ] `model/mock.ts` — мок-массив проектов на май 2026
- [ ] `lib/group-by-day.ts` — `Project[] → Map<dateKey, Project[]>`
- [ ] `ui/project-status-badge.tsx` — Badge `success`/`info`/`warning` + точка + лейбл
- [ ] `ui/project-count-badge.tsx` — Badge `counter` для ячейки календаря
- [ ] `ui/project-card.tsx` — карточка в Расписании (title + status, LOFT, тип, компания, телефон)
- [ ] `index.ts` — публичный API слайса

## widgets/project-calendar

- [ ] `lib/build-month-matrix.ts` — `date-fns`: 42 ячейки (`startOfWeek` с `weekStartsOn: 1`, `eachDayOfInterval`)
- [ ] `ui/calendar-toolbar.tsx` — Month с ‹ ›, Year, LOFT, Зал
- [ ] `ui/calendar-grid.tsx` — CSS grid 7×6, шапка ПН–ВС
- [ ] `ui/day-cell.tsx` — день + состояния: `today` (тёмный pill), `selected` (градиент + border), `out-of-month` (серый bg), + `ProjectCountBadge`
- [ ] `ui/project-calendar.tsx` — композиция toolbar + grid
- [ ] `index.ts`

## widgets/day-schedule

- [ ] `ui/day-schedule-header.tsx` — «Расписание» + «N проектов в этот день» (40px высота для выравнивания с toolbar)
- [ ] `ui/day-schedule.tsx` — header + Card с DatePill + список `ProjectCard`
- [ ] `index.ts`

## pages/calendar

- [ ] Локальный стейт: `selectedDate`, `visibleMonth`, `filters { loft, hall }`
- [ ] Подключить виджеты, прокинуть данные из мока через `entities/project`
- [ ] Двухколоночный grid: `ProjectCalendar` + `DaySchedule`
- [ ] Удалить заглушечный текст из `calendar-page.tsx`

## Финализация

- [ ] Прогнать `pnpm lint`, `pnpm build`
- [ ] Проверить визуально в браузере: today, selected, out-of-month, бейджи, переключение дня
- [ ] Коммит и PR в `main`

## После бэка (отложено)

- [ ] Добавить `Project` в `openapi.yaml`
- [ ] Заменить `entities/project/model/mock.ts` на kubb-хук в `entities/project/api/`
- [ ] MSW-моки до готовности эндпоинта
