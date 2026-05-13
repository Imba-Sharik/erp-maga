import type { Project } from './types'

const LOFT = 'LOFT#2'
const HALL = 'BACKYARD'
const MANAGER = 'Екатерина Миронова'
const PHONE = '+7 (999) 999 99 99'
const COMPANY = 'TechSpace'
const TYPE = 'Презентация'

const base = (
  id: string,
  date: string,
  title: string,
  status: Project['status'],
): Project => ({
  id,
  date,
  title,
  status,
  loft: LOFT,
  hall: HALL,
  manager: MANAGER,
  type: TYPE,
  company: COMPANY,
  phone: PHONE,
})

export const mockProjects: Project[] = [
  base('13-1', '2026-05-13', 'Demo Day Yandex', 'confirmed'),
  base('13-2', '2026-05-13', 'Корпоратив Авито', 'signed'),

  base('15-1', '2026-05-15', 'Презентация продукта', 'confirmed'),
  base('15-2', '2026-05-15', 'TechMeetup Spring', 'signed'),
  base('15-3', '2026-05-15', 'VK Afterparty', 'expenses'),

  base('16-1', '2026-05-16', 'Workshop Designhub', 'confirmed'),

  base('23-1', '2026-05-23', 'Тренинг Сбер', 'signed'),
  base('23-2', '2026-05-23', 'Свадебный фуршет', 'confirmed'),

  base('24-1', '2026-05-24', 'Кинопоказ', 'expenses'),
  base('24-2', '2026-05-24', 'Лекция Skillbox', 'confirmed'),
  base('24-3', '2026-05-24', 'Питч-сессия', 'signed'),
  base('24-4', '2026-05-24', 'Книжный клуб', 'confirmed'),
  base('24-5', '2026-05-24', 'Stand-up вечер', 'expenses'),

  base('26-1', '2026-05-26', 'Конференция Tinkoff', 'confirmed'),
  base('26-2', '2026-05-26', 'HR-завтрак', 'signed'),
  base('26-3', '2026-05-26', 'Релиз Notion', 'confirmed'),
  base('26-4', '2026-05-26', 'Networking VK', 'expenses'),
  base('26-5', '2026-05-26', 'Воркшоп Figma', 'confirmed'),
  base('26-6', '2026-05-26', 'Демо HeadHunter', 'signed'),
]
