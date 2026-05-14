import type { ProjectDetail } from './types'

export const mockProjectDetail: ProjectDetail = {
  id: 'P-2026-0142',
  title: 'VK Afterparty',
  date: '2026-05-15',
  status: 'signed',
  stage: 'signed',
  city: 'Москва',
  loft: 'LOFT#1',
  hall: 'Name',
  manager: 'Иванов Иван Иванович',
  type: 'Вечеринка',
  company: 'ООО «МАГ Продакшн»',
  phone: '+7 (999) 999-99-99',
  email: 'client@gmail.com',
  plumCardUrl: 'https://plum.example/cards/PL-89432',
  lastUpdate: '15.05.2026',

  enteredSystemAt: '2026-05-11T10:08:00',
  plumId: 'PL-89432',
  plumStatus: 'confirmed',
  plumComment: 'Гостей ~280, нужен расширенный звук, экран 3×5м.',
  plumSyncedAt: '2026-05-15',
  clientCompany: 'ООО «МАГ Продакшн»',
  clientStatus: 'confirmed',
  finance: {
    sales: 1_938_000,
    expenses: null,
    bonuses: null,
    netProfit: null,
  },
  history: [
    {
      stage: 'plum_request',
      enteredAt: '2026-05-06',
      managerName: 'Иванов Иван Иванович',
      data: {
        client: 'Иванов Иван Иванович',
        phone: '+7 (999) 999-99-99',
        email: 'client@gmail.com',
        contactPerson: 'Ленин Сталин Марксович',
        createdAt: '2026-05-06',
      },
    },
    {
      stage: 'first_contact',
      enteredAt: '2026-05-07',
      managerName: 'Иванов Иван Иванович',
      data: {
        contactComment: 'Договорились о смете до 25 апреля, нужен экран и расширенный звук.',
        contactChannel: 'messenger',
        contactedAt: '2026-05-07',
      },
    },
    {
      stage: 'calc_ready',
      enteredAt: '2026-05-09',
      managerName: 'Иванов Иван Иванович',
      data: {
        calcComment: 'Основной блок: оборудование + персонал ~ 1.6 млн, бэклайн 220 тыс',
      },
    },
  ],
}

export function getProjectDetailById(id: string): ProjectDetail | undefined {
  return id === mockProjectDetail.id ? mockProjectDetail : undefined
}
