import config from './lite.json'

/**
 * Глобальная скидка режима LITE. В реальном проекте она хранится в Supabase и включается владельцем в админке;
 * в демо значение зашито в lite.json (promo) — запросов в сеть нет.
 */
export type Promo = { enabled: boolean; percent: number }

export const PROMO_MIN = 1

const PROMO: Promo = { enabled: !!config.promo.enabled, percent: Number(config.promo.percent) || 0 }

/** Скидка режима LITE: компоненты читают её так же, как раньше (usePromo → active / percent) */
export function usePromo() {
  return { ...PROMO, active: PROMO.enabled && PROMO.percent >= PROMO_MIN }
}

/** Цена со скидкой, округление до 10 ₽ */
export const applyDiscount = (price: number, percent: number) => Math.round((price * (100 - percent)) / 100 / 10) * 10
