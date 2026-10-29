import { useMemo } from 'react'

/** Баннер по умолчанию: public/img/hero.webp (BASE_URL учитывает подпапку GitHub Pages) */
export const HERO_DEFAULT_PHOTO = `${import.meta.env.BASE_URL}img/hero.webp`

/** Фото сайта: в демо всегда стандартные из business.json / public (пустая строка = «по умолчанию») */
export type SiteMedia = { heroPhoto: string; gallery: string[] }

export const EMPTY_MEDIA: SiteMedia = { heroPhoto: '', gallery: ['', '', ''] }

/** В демо фото не грузятся из базы: возвращаем статичные значения */
export function useSiteMedia() {
  return useMemo(() => ({ media: EMPTY_MEDIA, loaded: true }), [])
}
