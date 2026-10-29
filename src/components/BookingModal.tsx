import type { ReactNode } from 'react'

import Sheet from './Sheet'
import { useProBooking } from './useProBooking'
import { useLiteBooking } from '../lite/useLiteBooking'
import { cn } from '../lib/cn'
import type { ShopSettings } from '../lib/settings'
import type { BusyInterval, ServiceId } from '../lib/slots'

export type Mode = 'lite' | 'pro'

/** Что хук формы отдаёт общему окну: заголовок, нижнюю панель и содержимое */
export type SheetParts = {
  title: string
  description?: string
  footer: ReactNode
  body: ReactNode
  /** Показан экран «Заявка отправлена» */
  success: boolean
  /** Вернуть форму в исходное состояние */
  reset: () => void
}

const TABS: { id: Mode; name: string; hint: string }[] = [
  { id: 'lite', name: 'Тариф LITE', hint: 'Просто заявки' },
  { id: 'pro', name: 'Тариф PRO', hint: 'Боксы + Время + Допы' },
]

type Props = {
  open: boolean
  /** done = true, если заявка отправлена: родитель сбрасывает формы */
  onClose: (done: boolean) => void
  mode: Mode
  onModeChange: (mode: Mode) => void
  /** Предвыбор услуги из строки прайса (только для PRO) */
  initialServiceId?: ServiceId
  settings: ShopSettings
  busy: BusyInterval[] | null
  reloadBusy: () => Promise<void>
}

/**
 * Окно записи демо. Одно окно (Sheet) и два набора формы — LITE и PRO — работают одновременно,
 * поэтому переключение вкладок мгновенное: без перезагрузки, без повторной анимации окна,
 * а то, что клиент уже ввёл в каждом режиме, сохраняется.
 */
export default function BookingModal({ open, onClose, mode, onModeChange, initialServiceId, settings, busy, reloadBusy }: Props) {
  const lite = useLiteBooking({
    onDone: () => onClose(true),
    onSwitchMode: () => switchTo(mode === 'lite' ? 'pro' : 'lite'),
  })
  const pro = useProBooking({
    open,
    onDone: () => onClose(true),
    initialServiceId,
    settings,
    busy,
    reloadBusy,
    onSwitchMode: () => switchTo(mode === 'lite' ? 'pro' : 'lite'),
  })

  // Уходя с экрана «Заявка отправлена», форма сбрасывается — вернувшись, клиент начнёт заново
  function switchTo(next: Mode) {
    if (next === mode) return
    if (lite.success) lite.reset()
    if (pro.success) pro.reset()
    onModeChange(next)
  }

  const parts = mode === 'lite' ? lite : pro

  const switcher = (
    <div
      role="tablist"
      aria-label="Тариф системы записи"
      className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1"
    >
      {TABS.map((t) => {
        const active = mode === t.id
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => switchTo(t.id)}
            className={cn(
              'flex min-h-12 min-w-0 flex-col items-center justify-center rounded-xl px-2 py-1.5 text-center leading-tight transition active:scale-[0.98]',
              active
                ? 'bg-brand text-brand-contrast shadow-[inset_0_1px_0_rgb(255_255_255/0.28)]'
                : 'text-zinc-400 hover:bg-white/[0.05] hover:text-white'
            )}
          >
            <span className="text-[13px] font-semibold">{t.name}</span>
            <span className={cn('max-w-full truncate text-[11px]', active ? 'opacity-80' : 'text-zinc-500')}>({t.hint})</span>
          </button>
        )
      })}
    </div>
  )

  return (
    <Sheet
      open={open}
      onClose={() => onClose(lite.success || pro.success)}
      title={parts.title}
      description={parts.description}
      footer={parts.footer}
      headerExtra={switcher}
      scrollKey={mode}
    >
      {parts.body}
    </Sheet>
  )
}
