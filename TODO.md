# Roadmap страниц

## ✅ /calendar — MVP в `main`

- [x] entities/project (типы, мок, group-by-day, schedule helpers, pluralProjects)
- [x] widgets/project-calendar (toolbar, grid, day-cell с состояниями today/selected/out-of-month)
- [x] widgets/day-schedule (header, DatePill, ScheduleDaySection, ProjectCard)
- [x] Мульти-выбор дат, реальный `today`, container-query для бейджа счётчика
- [x] Адаптив: 2 колонки от `min-[1400px]:`, тулбар flex-col → flex-row md+
- [x] PR #4 / #8 — мерж

## 🚧 /projects — текущая ветка `feat/projects-board`

- [x] Расширить `Project`: `stage`, `email`, `plumCardUrl`, `lastUpdate`
- [x] `entities/project/lib/stages.ts` — `STAGE_ORDER`, `STAGE_LABELS`, `groupByStage`
- [x] `entities/project/ui/project-pipeline-card.tsx` — карточка kanban
- [x] `widgets/projects-board` — composer + toolbar (search + city/hall/loft) + kanban + column
- [x] `pages/projects` — page header с «Добавить проект» + `<ProjectsBoard />`
- [x] Адаптив через `@container` на доске: < 1400 → горизонтальный скролл, ≥ 1400 → равные колонки
- [x] Figma «Code sync — /projects» (`node-id=2474:2`)
- [ ] Финальная визуальная проверка после перезапуска dev-сервера (нужен `vite-plugin-svgr`)
- [ ] Коммит + PR
- [ ] После мержа — обновить «Code sync — /projects» в Figma актуальным скрином

## 📋 Следующее (после `/projects`)

- [ ] `/dashboard` — макет от дизайнера, сейчас заглушка
- [ ] `/closing` — макет от дизайнера, сейчас заглушка
- [ ] `/notifications` — макет от дизайнера, сейчас заглушка
- [ ] `features/create-project` — диалог по кнопке «Добавить проект» (вынести из inline в `pages/projects`)
- [ ] `features/project-card-menu` — Dropdown с «Перенести в этап X», «Открыть в PLUM», «Архивировать»

## 🔧 Технический долг

- [ ] Хардкод hex-цветов в коде (`#1B1A17`, `#ACACAC`, `#B1B1B1`, `#F3F3F3`, `#5E83E3`, `#454545`) — вынести в oklch-токены в `src/index.css`
- [ ] `--sidebar-accent-foreground: #000000` в `index.css` — перевести в `oklch(0 0 0)` для консистентности
- [ ] `bundle > 500 KB` — настроить code-splitting в `vite.config.ts`
- [ ] `useIsMobile` / `sidebar.tsx` Math.random — мелкие lint-замечания (PR #5 в основном закрыл, но `react-refresh/only-export-components` на `badge.tsx`/`button.tsx` остаётся)

## После бэка

- [ ] Добавить `Project` (+ stage, status) в `openapi.yaml` (drf-spectacular)
- [ ] Заменить `entities/project/model/mock.ts` на kubb-хуки в `entities/project/api/`
- [ ] MSW для оффлайн-разработки
