import { useCallback, useMemo } from 'react'

import { SERVICES, type BoxActiveMap, type ServiceCatalog, type ServicesConfig } from './slots'

/**
 * Настройки владельца. В демо они фиксированы и живут только во фронтенде:
 * все боксы включены, скидки нет, прайс — каталог по умолчанию из lib/slots.ts.
 */
export type ShopSettings = {
  /** Бокс принимает клиентов: { 1: true, 2: false, 3: true } */
  boxActive: Record<1 | 2 | 3, boolean>
  discountEnabled: boolean
  /** 0–90 */
  discountPercent: number
  servicesConfig: ServicesConfig | null
  /** Рабочий каталог (его берут форма записи и генератор слотов) */
  services: ServiceCatalog
  allServices: ServiceCatalog
}

export const DEFAULT_SETTINGS: ShopSettings = {
  boxActive: { 1: true, 2: true, 3: true },
  discountEnabled: false,
  discountPercent: 0,
  servicesConfig: null,
  services: SERVICES,
  allServices: SERVICES,
}

/** Для генератора слотов */
export const toBoxActive = (s: ShopSettings): BoxActiveMap => ({ ...s.boxActive })

/* ---------- Скидка ---------- */

/** Действующий процент: 0, если скидка выключена */
export const activeDiscount = (s: Pick<ShopSettings, 'discountEnabled' | 'discountPercent'>) =>
  s.discountEnabled && s.discountPercent > 0 ? s.discountPercent : 0

/** Цена со скидкой, целые рубли */
export const discounted = (price: number, percent: number) =>
  percent > 0 ? Math.round((price * (100 - percent)) / 100) : price

/** Для вывода: oldPrice есть только когда скидка действует (его рисуем зачёркнутым) */
export const priceView = (price: number, percent: number) =>
  percent > 0 ? { price: discounted(price, percent), oldPrice: price } : { price, oldPrice: null as number | null }

/** Хук для клиента: настройки доступны сразу, без сети */
export function useShopSettings() {
  const reload = useCallback(async (): Promise<ShopSettings | null> => DEFAULT_SETTINGS, [])
  return useMemo(() => ({ settings: DEFAULT_SETTINGS, loaded: true, reload }), [reload])
}
