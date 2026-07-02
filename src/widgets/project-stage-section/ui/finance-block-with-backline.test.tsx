// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest'

// useUserRole ходит в React Query (`/users/me/`) — подменяем на Руководителя, чтобы не
// поднимать QueryClientProvider; роль тут влияет только на editableCurrent.
vi.mock('@/entities/user-role', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/user-role')>()),
  useUserRole: () => 'director' as const,
}))
// RollbackStageButton (рендерится на текущем этапе) тянет мутацию — глушим.
vi.mock('@/features/rollback-stage', () => ({
  RollbackStageButton: () => null,
}))

import type { ProjectDetail } from '@/entities/project'
import {
  createEmptyBacklineBlock,
  createInitialArticles,
  type ProjectArticles,
} from '@/entities/project-article'
import { STAGE_PRESENTATION } from '@/shared/lib/stage-presentation'

import { FinanceBlockWithBackline } from './finance-block-with-backline'

afterEach(cleanup)

const noop = () => {}

interface Handlers {
  onToggleBackline: Mock
  onAddBackline: Mock
  onRemoveBackline: Mock
}

function renderBlock(
  opts: { isCurrent?: boolean; onSavePassed?: () => void; articles?: ProjectArticles } = {},
): Handlers {
  const handlers: Handlers = {
    onToggleBackline: vi.fn(),
    onAddBackline: vi.fn(() => Promise.resolve()),
    onRemoveBackline: vi.fn(() => Promise.resolve()),
  }
  render(
    <FinanceBlockWithBackline
      presentation={STAGE_PRESENTATION.pipeline}
      project={{} as ProjectDetail}
      stage="ready_to_event"
      headerTitle="Готов к проведению"
      headerColorClass="text-funnel-preproject"
      aspect="sales"
      isCurrent={opts.isCurrent ?? false}
      articles={opts.articles ?? createInitialArticles()}
      taxRate={15}
      onArticleChange={noop}
      onTaxRateChange={noop}
      onToggleBackline={handlers.onToggleBackline}
      onAddBackline={handlers.onAddBackline}
      onRemoveBackline={handlers.onRemoveBackline}
      onSavePassed={opts.onSavePassed}
      onReplaceArticles={noop}
    />,
  )
  return handlers
}

describe('FinanceBlockWithBackline — бэклайн на правке пройденного этапа', () => {
  it('в режиме просмотра пройденного этапа кнопки бэклайна нет', () => {
    renderBlock({ onSavePassed: vi.fn() })
    expect(screen.queryByText('Добавить бэклайн')).toBeNull()
  })

  it('после «Редактировать» «Добавить бэклайн» зовёт эндпоинт /backline/, а не локальный флип', () => {
    const h = renderBlock({ onSavePassed: vi.fn() })
    fireEvent.click(screen.getByText('Редактировать'))
    fireEvent.click(screen.getByText('Добавить бэклайн'))
    expect(h.onAddBackline).toHaveBeenCalledTimes(1)
    expect(h.onToggleBackline).not.toHaveBeenCalled()
  })

  it('«Удалить бэклайн» на правке пройденного этапа зовёт DELETE /backline/', () => {
    const articles = createInitialArticles()
    articles.backline = createEmptyBacklineBlock()
    const h = renderBlock({ onSavePassed: vi.fn(), articles })

    expect(screen.queryByText('Удалить бэклайн')).toBeNull()
    fireEvent.click(screen.getByText('Редактировать'))
    fireEvent.click(screen.getByText('Удалить бэклайн'))
    expect(h.onRemoveBackline).toHaveBeenCalledTimes(1)
    expect(h.onToggleBackline).not.toHaveBeenCalled()
  })

  it('на текущем этапе кнопка использует локальный флип (onToggleBackline)', () => {
    const h = renderBlock({ isCurrent: true })
    fireEvent.click(screen.getByText('Добавить бэклайн'))
    expect(h.onToggleBackline).toHaveBeenCalledTimes(1)
    expect(h.onAddBackline).not.toHaveBeenCalled()
  })
})
