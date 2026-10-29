import config from '../business.json'

/** Допустимые значения подготовки бокса между автомобилями, мин */
export const BUFFER_OPTIONS = [0, 15, 30, 45, 60] as const

/** Количество ссылок на фото бокса */
export const PHOTO_SLOTS = 4

/** Настройки плитки бокса (в демо — всё берётся из business.json, без базы данных) */
export type GuestSettings = {
  /** Сколько человек включено в цену */
  baseGuests: number
  /** Максимум гостей (лимит кнопки «+») */
  maxGuests: number
  /** Доплата за каждого гостя сверх baseGuests, ₽ */
  extraGuestPrice: number
  /** Буфер на уборку после каждой брони, мин */
  cleaningBufferMin: number
  /** Акция включена */
  promoEnabled: boolean
  /** Текст акции для бейджа */
  promoText: string
  /** Скидка, % */
  promoPercent: number
  /** Ссылки на фото (до PHOTO_SLOTS), пустые строки отброшены при показе */
  photos: string[]
}

/** Переопределения настроек по id бокса (в демо всегда пусто) */
export type GuestSettingsMap = Record<string, Partial<GuestSettings>>

/** Что может лежать в business.json у бокса */
type ServiceDefaults = Partial<GuestSettings> & { id: string }

const CONFIG_BUFFER = Number((config as { prepTimeMinutes?: number }).prepTimeMinutes) || 0

const FALLBACK: GuestSettings = {
  baseGuests: 8,
  maxGuests: 10,
  extraGuestPrice: 0,
  cleaningBufferMin: CONFIG_BUFFER,
  promoEnabled: false,
  promoText: '',
  promoPercent: 0,
  photos: [],
}

const num = (v: unknown, def: number) => {
  if (v === null || v === undefined || v === '') return def
  const n = Number(v)
  return Number.isFinite(n) ? n : def
}

/** Ближайшее допустимое значение буфера */
const snapBuffer = (v: number) =>
  BUFFER_OPTIONS.reduce((best, o) => (Math.abs(o - v) < Math.abs(best - v) ? o : best), 0 as number)

/** Любая ссылка, начинающаяся с http:// или https:// (javascript:, data: и т.п. отбрасываем) */
export const isValidPhotoUrl = (s: string) => /^https?:\/\/./i.test(s.trim())

/** Приводит значения к допустимым: base ≥ 1, max ≥ base, доплата ≥ 0, скидка 0–99, буфер из списка */
export function normalizeGuestSettings(raw: Partial<GuestSettings>): GuestSettings {
  const baseGuests = Math.max(1, Math.floor(num(raw.baseGuests, FALLBACK.baseGuests)))
  const maxGuests = Math.max(baseGuests, Math.floor(num(raw.maxGuests, FALLBACK.maxGuests)))
  const extraGuestPrice = Math.max(0, num(raw.extraGuestPrice, FALLBACK.extraGuestPrice))
  const cleaningBufferMin = snapBuffer(Math.max(0, num(raw.cleaningBufferMin, FALLBACK.cleaningBufferMin)))
  const promoPercent = Math.min(99, Math.max(0, num(raw.promoPercent, 0)))
  const photos = (raw.photos ?? []).slice(0, PHOTO_SLOTS).map((p) => (p ?? '').trim())
  return {
    baseGuests,
    maxGuests,
    extraGuestPrice,
    cleaningBufferMin,
    promoEnabled: !!raw.promoEnabled,
    promoText: (raw.promoText ?? '').trim(),
    promoPercent,
    photos,
  }
}

/** Итоговые настройки бокса: значения из business.json → иначе дефолт */
export function resolveGuestSettings(service: ServiceDefaults, overrides: GuestSettingsMap): GuestSettings {
  const o = overrides[service.id]
  return normalizeGuestSettings({
    baseGuests: o?.baseGuests ?? service.baseGuests,
    maxGuests: o?.maxGuests ?? service.maxGuests,
    extraGuestPrice: o?.extraGuestPrice ?? service.extraGuestPrice,
    cleaningBufferMin: o?.cleaningBufferMin ?? service.cleaningBufferMin,
    promoEnabled: o?.promoEnabled ?? service.promoEnabled,
    promoText: o?.promoText ?? service.promoText,
    promoPercent: o?.promoPercent ?? service.promoPercent,
    photos: Array.from({ length: PHOTO_SLOTS }, (_, i) => o?.photos?.[i]?.trim() || service.photos?.[i] || ''),
  })
}

/** Непустые корректные ссылки на фото */
export const visiblePhotos = (s: GuestSettings | null | undefined) =>
  (s?.photos ?? []).filter(isValidPhotoUrl).map((p) => p.trim())
