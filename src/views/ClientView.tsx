import { useCallback, useEffect, useState } from 'react'

import BookingModal, { type Mode } from '../components/BookingModal'
import BookingWidget from '../components/BookingWidget'
import BoxTile from '../components/BoxTile'
import DemoBanner from '../components/DemoBanner'
import FloatingContact from '../components/FloatingContact'
import Gallery from '../components/Gallery'
import Hero from '../components/Hero'
import PillNav from '../components/PillNav'
import Preloader from '../components/Preloader'
import ServiceTable from '../components/ServiceTable'
import StatsRow from '../components/StatsRow'
import { BOXES, boxNumber, boxPriceFrom, type Box } from '../lib/catalog'
import { boxStatus, isOpenAt, type BoxStatus } from '../lib/availability'
import { fetchBusy } from '../lib/busy'
import { resolveGuestSettings } from '../lib/guestSettings'
import { activeDiscount, useShopSettings } from '../lib/settings'
import { useSiteMedia } from '../lib/siteMedia'
import type { BusyInterval, ServiceId } from '../lib/slots'

type SheetState = { open: boolean; key: number; serviceId?: ServiceId }

export default function ClientView() {
  const [sheet, setSheet] = useState<SheetState>({ open: false, key: 0 })
  // Какой тариф показан в окне записи (по умолчанию LITE — первая вкладка)
  const [mode, setMode] = useState<Mode>('lite')
  const [now, setNow] = useState(() => new Date())
  // null — занятость ещё «грузится»
  const [busy, setBusy] = useState<BusyInterval[] | null>(null)

  /* ---- Настройки студии (в демо фиксированные) и фото сайта ---- */
  const { settings } = useShopSettings()
  const discountPercent = activeDiscount(settings)
  const { media } = useSiteMedia()

  /* ---- Занятость боксов: генерируется локально, общая для плиток и формы ---- */
  const reloadBusy = useCallback(async () => {
    setBusy(await fetchBusy())
  }, [])

  useEffect(() => {
    void reloadBusy()
    const timer = window.setInterval(() => {
      setNow(new Date())
      void reloadBusy()
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [reloadBusy])

  /* ---- Прелоадер: короткая заставка, пока «приходит» занятость ---- */
  const appLoading = busy === null

  /* ---- Статус боксов (логика — boxStatus в lib/availability.ts) ---- */
  const openNow = isOpenAt(now)
  const activeOf = (b: Box) => settings.boxActive[boxNumber(b) as 1 | 2 | 3] !== false
  const statusOf = (b: Box): BoxStatus | null => {
    if (!activeOf(b)) return boxStatus(now, [], false)
    if (openNow && !busy) return null // занятость ещё не загрузилась
    return boxStatus(now, (busy ?? []).filter((x) => x.box_id === boxNumber(b)), true)
  }
  const statusKnown = openNow && busy !== null
  const freeCount = BOXES.filter((b) => statusOf(b)?.kind === 'free').length
  const totalBoxes = BOXES.filter(activeOf).length

  /* ---- Открытие окна записи ---- */
  const openBooking = (preset?: { serviceId?: ServiceId }) =>
    setSheet((s) =>
      preset
        ? { open: true, key: s.key + 1, serviceId: preset.serviceId } // строка прайса → форма с нуля
        : { ...s, open: true } // общая кнопка → продолжаем с того места, где остановился клиент
    )
  const closeSheet = (done: boolean) => {
    if (done) setSheet((s) => ({ open: false, key: s.key + 1 }))
    else setSheet((s) => ({ ...s, open: false }))
  }

  // Строки прайса — это услуги режима PRO, поэтому открываем PRO сразу с выбранной услугой
  const bookService = (serviceId: ServiceId) => {
    setMode('pro')
    openBooking({ serviceId })
  }

  /* ---------- Разметка ---------- */
  return (
    <div className="min-h-dvh bg-black">
      <Preloader loading={appLoading} />
      <DemoBanner />
      {/*
        Bento-сетка: на десктопе 12 колонок, на телефоне одна.
        Hero и статистика — на всю ширину; ниже услуги (8) и липкий виджет записи (4).
      */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-32 pt-4 lg:pb-10">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div id="home" className="lg:col-span-12">
            <Hero freeBoxes={statusKnown ? freeCount : null} totalBoxes={totalBoxes} photo={media.heroPhoto} onBook={() => openBooking()} />
          </div>

          <div className="lg:col-span-12">
            <StatsRow services={settings.services} />
          </div>

          <main className="flex min-w-0 flex-col gap-8 lg:col-span-8">
            <ServiceTable discountPercent={discountPercent} services={settings.services} onBook={bookService} />

            <Gallery photos={media.gallery} />

            <section id="boxes" className="scroll-mt-4" aria-labelledby="boxes-title">
              <div className="mb-3 flex items-baseline gap-3 px-1">
                <h2 id="boxes-title" className="text-xl font-semibold tracking-tight text-white">
                  Боксы
                </h2>
                <p className="text-xs text-zinc-500">У каждого своя специализация и свой календарь</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {BOXES.map((b, i) => (
                  <BoxTile
                    key={b.id}
                    box={b}
                    settings={resolveGuestSettings(b, {})}
                    status={statusOf(b)}
                    discountPercent={discountPercent}
                    priceFrom={boxPriceFrom(b, settings.services)}
                    ready
                    priority={i === 0}
                    onBook={() => openBooking()}
                  />
                ))}
              </div>
            </section>
          </main>

          {/* Правая колонка: контейнер тянется на всю высоту, виджет внутри залипает */}
          <aside className="lg:col-span-4">
            <BookingWidget freeBoxes={statusKnown ? freeCount : null} totalBoxes={totalBoxes} onBook={() => openBooking()} />
          </aside>

          <footer className="pt-4 text-center text-xs text-zinc-600 lg:col-span-12">
            PRIME DETAILING • DEMO · все данные вымышлены, заявки никуда не отправляются
          </footer>
        </div>
      </div>

      {/* Плавающие элементы: таблетка навигации (только телефон) и кнопка связи */}
      <PillNav bookingOpen={sheet.open} onBooking={() => openBooking()} />
      <FloatingContact hidden={sheet.open} />

      <BookingModal
        key={sheet.key}
        open={sheet.open}
        onClose={closeSheet}
        mode={mode}
        onModeChange={setMode}
        initialServiceId={sheet.serviceId}
        settings={settings}
        busy={busy}
        reloadBusy={reloadBusy}
      />
    </div>
  )
}
