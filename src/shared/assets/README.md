# Assets

Эта директория содержит статические ресурсы проекта (SVG, изображения, шрифты и т.д.), организованные по категориям.

## Структура

- `icons/` — иконки интерфейса
- `logos/` — логотипы брендов и компаний
- `index.ts` — централизованный экспорт ресурсов

## Использование

### Импорт через index.ts (рекомендуется)

Все ресурсы реэкспортируются через `@/shared/assets`:

```tsx
import { MagLogo } from '@/shared/assets'

export function Header() {
  return <MagLogo className="text-primary h-10 w-auto" aria-label="MAG Logo" />
}
```

### Прямой импорт (для особых случаев)

Если нужен прямой импорт, добавьте суффикс `?react`:

```tsx
import MagLogo from '@/shared/assets/logos/mag-logo.svg?react'
```

### Особенности

- **TypeScript**: полная поддержка типов из коробки
- **Props**: все стандартные SVG-props (`className`, `aria-*`, `style`, и т.д.)
- **ForwardRef**: поддержка ref для интеграции с библиотеками
- **Темизация**: чёрный цвет (`#000`, `black`) автоматически заменяется на `currentColor`
- **Оптимизация**: SVGO автоматически минифицирует SVG
- **Масштабирование**: `viewBox` сохраняется, размеры управляются через CSS

### Пример с темизацией

```tsx
import Icon from '@/shared/assets/icons/example.svg?react'

// Иконка будет наследовать цвет из контекста
;<Icon className="h-6 w-6 text-blue-500" />
```

## Конфигурация

Настройки SVGR находятся в [`vite.config.ts`](../../../vite.config.ts):

- `typescript: true` — генерация TS-компонентов
- `ref: true` — поддержка forwardRef
- `dimensions: false` — удаление width/height для гибкого масштабирования
- `replaceAttrValues` — замена цветов на `currentColor`
- `svgo: true` — оптимизация через SVGO
- `prefixIds` — уникальные ID для предотвращения конфликтов

## Альтернативные способы импорта

### Как URL (для `<img>` или CSS)

```tsx
import logoUrl from '@/shared/assets/logos/example.svg?url'
;<img src={logoUrl} alt="Logo" />
```

### Как строка

```tsx
import logoRaw from '@/shared/assets/logos/example.svg?raw'

// Для dangerouslySetInnerHTML или обработки
```

## Рекомендации

1. **Именование файлов**: kebab-case (например, `user-avatar.svg`)
2. **Оптимизация**: проверяйте SVG перед добавлением (удаляйте лишние слои, группы)
3. **Цвета**: используйте `currentColor` или чёрный для интерфейсных иконок
4. **Размер**: для сложных иллюстраций рассмотрите импорт как URL (`?url`)
5. **Accessibility**: всегда добавляйте `aria-label` или `aria-hidden`

## Добавление новых ресурсов

### Для SVG

1. Добавьте SVG-файл в соответствующую папку (`icons/`, `logos/`)
2. Убедитесь, что основной цвет в SVG — `#000000` (для работы с `currentColor`)
3. Реэкспортируйте его в [`index.ts`](./index.ts):

```typescript
// В src/shared/assets/index.ts
export { default as NewIcon } from './icons/new-icon.svg?react'
```

4. Используйте в компонентах:

```tsx
import { NewIcon } from '@/shared/assets'
;<NewIcon className="size-6" />
```

### Для изображений (PNG, JPG, WebP и т.д.)

1. Добавьте файл в соответствующую папку
2. Импортируйте как URL:

```tsx
import avatarUrl from '@/shared/assets/images/avatar.png'
;<img src={avatarUrl} alt="Avatar" />
```

### Для других ресурсов

Аналогично изображениям — используйте прямой импорт или реэкспорт через `index.ts` при необходимости.

## Примеры из проекта

```tsx
// Логотип в сайдбаре
import { MagLogo } from '@/shared/assets'
;<MagLogo aria-label="ERP MAG" className="size-10" />
```
