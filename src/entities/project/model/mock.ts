import type { Project, ProjectStage } from './types'

const LOFT = 'LOFT#2'
const HALL = 'BACKYARD'
const MANAGER = 'Екатерина Миронова'
const PHONE = '+7 (999) 999 99 99'
const COMPANY = 'TechSpace'
const TYPE = 'Презентация'
const EMAIL = 'ivanov@gmail.com'
const PLUM_URL = 'https://plum.example/cards/A-001'
const LAST_UPDATE = 'Вчера: 16:35'

const base = (
  id: string,
  date: string,
  title: string,
  status: Project['status'],
  stage: ProjectStage,
): Project => ({
  id,
  date,
  title,
  status,
  stage,
  loft: LOFT,
  hall: HALL,
  manager: MANAGER,
  type: TYPE,
  company: COMPANY,
  phone: PHONE,
  email: EMAIL,
  plumCardUrl: PLUM_URL,
  lastUpdate: LAST_UPDATE,
})

export const mockProjects: Project[] = [
  // Раннее: ещё нет даты — заявка только пришла
  base('p-001', '2026-05-30', 'Презентация Habr', 'confirmed', 'plum_request'),

  // Менеджер связался, обсуждаем детали
  base('p-002', '2026-06-05', 'Корпоратив Альфа-Банк', 'confirmed', 'first_contact'),
  base('p-003', '2026-06-12', 'Релиз Wildberries', 'confirmed', 'first_contact'),

  // Расчёт готов, ждём подписания
  base('p-004', '2026-06-20', 'Конференция Yandex Cloud', 'confirmed', 'calc_ready'),
  base('p-005', '2026-06-21', 'Юбилей Ozon Tech', 'confirmed', 'calc_ready'),
  base('p-006', '2026-06-22', 'Воркшоп Tinkoff', 'confirmed', 'calc_ready'),

  // Договор подписан — попадают в календарь
  base('15-1', '2026-05-15', 'Презентация продукта', 'signed', 'signed'),
  base('15-2', '2026-05-15', 'TechMeetup Spring', 'signed', 'signed'),
  base('13-1', '2026-05-13', 'Demo Day Yandex', 'confirmed', 'signed'),
  base('13-2', '2026-05-13', 'Корпоратив Авито', 'signed', 'signed'),
  base('16-1', '2026-05-16', 'Workshop Designhub', 'confirmed', 'signed'),
  base('23-1', '2026-05-23', 'Тренинг Сбер', 'signed', 'signed'),
  base('23-2', '2026-05-23', 'Свадебный фуршет', 'confirmed', 'signed'),
  base('26-1', '2026-05-26', 'Конференция Tinkoff', 'confirmed', 'signed'),
  base('26-2', '2026-05-26', 'HR-завтрак', 'signed', 'signed'),

  // Готов к проведению — всё подготовлено
  base('15-3', '2026-05-15', 'VK Afterparty', 'expenses', 'ready'),
  base('24-1', '2026-05-24', 'Кинопоказ', 'expenses', 'ready'),
  base('24-2', '2026-05-24', 'Лекция Skillbox', 'confirmed', 'ready'),
  base('24-3', '2026-05-24', 'Питч-сессия', 'signed', 'ready'),
  base('24-4', '2026-05-24', 'Книжный клуб', 'confirmed', 'ready'),
  base('24-5', '2026-05-24', 'Stand-up вечер', 'expenses', 'ready'),
  base('26-3', '2026-05-26', 'Релиз Notion', 'confirmed', 'ready'),
  base('26-4', '2026-05-26', 'Networking VK', 'expenses', 'ready'),
  base('26-5', '2026-05-26', 'Воркшоп Figma', 'confirmed', 'ready'),
  base('26-6', '2026-05-26', 'Демо HeadHunter', 'signed', 'ready'),
]
