import type { Project, ProjectStage } from './types'

const MANAGER = 'Екатерина Миронова'
const PHONE = '+7 (999) 999 99 99'
const COMPANY = 'TechSpace'
const TYPE = 'Презентация'
const EMAIL = 'ivanov@gmail.com'
const PLUM_URL = 'https://plum.example/cards/A-001'
const LAST_UPDATE = 'Вчера: 16:35'

const make = (
  id: string,
  date: string,
  title: string,
  status: Project['status'],
  stage: ProjectStage,
  city: string,
  loft: string,
  hall: string,
): Project => ({
  id,
  date,
  title,
  status,
  stage,
  city,
  loft,
  hall,
  manager: MANAGER,
  type: TYPE,
  company: COMPANY,
  phone: PHONE,
  email: EMAIL,
  plumCardUrl: PLUM_URL,
  lastUpdate: LAST_UPDATE,
})

export const mockProjects: Project[] = [
  // Заявка из PLUM
  make('p-001', '2026-05-30', 'Презентация Habr', 'confirmed', 'plum_request', 'Москва', 'LOFT#1', 'MAIN'),

  // Первичный контакт
  make('p-002', '2026-06-05', 'Корпоратив Альфа-Банк', 'confirmed', 'first_contact', 'Санкт-Петербург', 'LOFT#2', 'BACKYARD'),
  make('p-003', '2026-06-12', 'Релиз Wildberries', 'confirmed', 'first_contact', 'Казань', 'LOFT#3', 'ROOFTOP'),

  // Расчёт подготовлен
  make('p-004', '2026-06-20', 'Конференция Yandex Cloud', 'confirmed', 'calc_ready', 'Москва', 'LOFT#1', 'ROOFTOP'),
  make('p-005', '2026-06-21', 'Юбилей Ozon Tech', 'confirmed', 'calc_ready', 'Санкт-Петербург', 'LOFT#2', 'MAIN'),
  make('p-006', '2026-06-22', 'Воркшоп Tinkoff', 'confirmed', 'calc_ready', 'Казань', 'LOFT#3', 'MAIN'),

  // Договор подписан — попадают в календарь
  make('15-1', '2026-05-15', 'Презентация продукта', 'signed', 'signed', 'Санкт-Петербург', 'LOFT#2', 'BACKYARD'),
  make('15-2', '2026-05-15', 'TechMeetup Spring', 'signed', 'signed', 'Москва', 'LOFT#1', 'MAIN'),
  make('13-1', '2026-05-13', 'Demo Day Yandex', 'confirmed', 'signed', 'Санкт-Петербург', 'LOFT#2', 'BACKYARD'),
  make('13-2', '2026-05-13', 'Корпоратив Авито', 'signed', 'signed', 'Казань', 'LOFT#3', 'ROOFTOP'),
  make('16-1', '2026-05-16', 'Workshop Designhub', 'confirmed', 'signed', 'Москва', 'LOFT#1', 'ROOFTOP'),
  make('23-1', '2026-05-23', 'Тренинг Сбер', 'signed', 'signed', 'Санкт-Петербург', 'LOFT#2', 'MAIN'),
  make('23-2', '2026-05-23', 'Свадебный фуршет', 'confirmed', 'signed', 'Казань', 'LOFT#3', 'BACKYARD'),
  make('26-1', '2026-05-26', 'Конференция Tinkoff', 'confirmed', 'signed', 'Москва', 'LOFT#1', 'MAIN'),
  make('26-2', '2026-05-26', 'HR-завтрак', 'signed', 'signed', 'Санкт-Петербург', 'LOFT#2', 'MAIN'),

  // Готов к проведению
  make('15-3', '2026-05-15', 'VK Afterparty', 'expenses', 'ready', 'Москва', 'LOFT#1', 'ROOFTOP'),
  make('24-1', '2026-05-24', 'Кинопоказ', 'expenses', 'ready', 'Казань', 'LOFT#3', 'MAIN'),
  make('24-2', '2026-05-24', 'Лекция Skillbox', 'confirmed', 'ready', 'Москва', 'LOFT#1', 'MAIN'),
  make('24-3', '2026-05-24', 'Питч-сессия', 'signed', 'ready', 'Санкт-Петербург', 'LOFT#2', 'BACKYARD'),
  make('24-4', '2026-05-24', 'Книжный клуб', 'confirmed', 'ready', 'Казань', 'LOFT#3', 'ROOFTOP'),
  make('24-5', '2026-05-24', 'Stand-up вечер', 'expenses', 'ready', 'Москва', 'LOFT#1', 'ROOFTOP'),
  make('26-3', '2026-05-26', 'Релиз Notion', 'confirmed', 'ready', 'Санкт-Петербург', 'LOFT#2', 'MAIN'),
  make('26-4', '2026-05-26', 'Networking VK', 'expenses', 'ready', 'Казань', 'LOFT#3', 'BACKYARD'),
  make('26-5', '2026-05-26', 'Воркшоп Figma', 'confirmed', 'ready', 'Москва', 'LOFT#1', 'MAIN'),
  make('26-6', '2026-05-26', 'Демо HeadHunter', 'signed', 'ready', 'Санкт-Петербург', 'LOFT#2', 'BACKYARD'),
]
