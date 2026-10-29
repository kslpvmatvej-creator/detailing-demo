import { formatPrice } from './format'

/**
 * Тексты уведомлений, которые демо показывает в превью Telegram.
 * Формат строк — ровно как в шаблонах владельца; ничего никуда не отправляется.
 */

/** Пустое значение → прочерк */
const orDash = (v?: string | null) => (v && v.trim() ? v.trim() : '—')

export type LiteTelegramData = {
  service: string
  vehicle: string
  name: string
  phone: string
  source: string | null
  comment?: string
  /** Цена по прайсу (без скидки) */
  price: number
  /** Текстовая цена вместо числа («Индивидуальный расчёт») */
  priceLabel?: string
}

export function buildLiteMessage(d: LiteTelegramData): string[] {
  return [
    '🔥 Новая заявка!',
    `Услуга: ${d.service}`,
    `Авто: ${d.vehicle}`,
    `Клиент: ${d.name}`,
    `Телефон: ${d.phone}`,
    `Источник: ${orDash(d.source)}`,
    `Комментарий: ${orDash(d.comment)}`,
    `Цена по прайсу: ${d.priceLabel ?? `от ${formatPrice(d.price)}`}`,
  ]
}

export type ProTelegramData = {
  vehicle: string
  vehicleClass: string
  service: string
  /** Выбранные допы: название и количество */
  extras: { name: string; qty: number }[]
  /** «30 октября» */
  date: string
  /** «12:00» */
  time: string
  name: string
  phone: string
  comment?: string
  total: number
}

export function buildProMessage(d: ProTelegramData): string[] {
  const extras = d.extras.length
    ? d.extras.map((e) => (e.qty > 1 ? `${e.name} × ${e.qty}` : e.name)).join(', ')
    : 'Нет'
  return [
    '🔥 Новая запись в бокс!',
    `Авто: ${d.vehicle} (${d.vehicleClass})`,
    `Услуга: ${d.service}`,
    `Доп. услуги: ${extras}`,
    `Дата и время: ${d.date} в ${d.time}`,
    `Клиент: ${d.name}`,
    `Телефон: ${d.phone}`,
    `Комментарий: ${orDash(d.comment)}`,
    `Итого к оплате: ${formatPrice(d.total)}`,
  ]
}
