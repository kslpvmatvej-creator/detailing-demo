import { useEffect, useState } from 'react'

import { btnGlass } from '../lib/ui'
import { cn } from '../lib/cn'

type Props = {
  /** Строки сообщения: первая — заголовок */
  lines: string[]
  /** Переключить вкладку тарифа и проверить второй режим */
  onSwitchMode: () => void
}

/** Время отправки «ЧЧ:ММ» по часам посетителя */
const nowTime = () => new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

/** Значение после «Телефон: » Telegram подсвечивает как ссылку */
const PHONE_PREFIX = 'Телефон: '

/**
 * Демо-блок на экране успеха: как эта заявка выглядит у владельца в Telegram-боте.
 * Тёмная тема Telegram: пузырь #182533, время справа внизу. Данные — ровно те, что клиент ввёл в форму.
 */
export default function TelegramPreview({ lines, onSwitchMode }: Props) {
  const [time] = useState(nowTime)
  // Короткое «печатает…» перед сообщением — чтобы было видно, что оно «прилетает»
  const [typing, setTyping] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setTyping(false), 700)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className="mt-6">
      <p className="mb-3 text-sm font-medium leading-snug text-zinc-100">👇 Вот так эта заявка прилетает владельцу в Telegram:</p>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0e1621] shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)]">
        {/* Шапка чата с ботом */}
        <div className="flex items-center gap-3 bg-[#17212b] px-3.5 py-2.5">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4f9cf9] to-[#2563eb] text-sm font-semibold text-white"
          >
            P
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[14px] font-semibold text-white">PRIME • Заявки</span>
            <span className={cn('block text-xs', typing ? 'text-[#6ab3f3]' : 'text-[#6d7f8f]')}>
              {typing ? 'печатает…' : 'бот'}
            </span>
          </span>
        </div>

        {/* Переписка */}
        <div className="min-h-[7.5rem] bg-[radial-gradient(120%_80%_at_50%_0%,#13202d_0%,#0e1621_70%)] px-3 pb-4 pt-3">
          <div className="mb-3 flex justify-center">
            <span className="rounded-full bg-[#182533]/90 px-3 py-0.5 text-xs text-[#8fa1b3]">Сегодня</span>
          </div>

          {typing ? (
            <div className="inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-[#182533] px-4 py-3" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6d7f8f]"
                  style={{ animationDelay: `${i * 160}ms` }}
                />
              ))}
            </div>
          ) : (
            <div className="animate-rise max-w-[94%] rounded-2xl rounded-bl-md bg-[#182533] px-3 pb-1.5 pt-2 text-[14px] leading-[1.4] text-white">
              {lines.map((line, i) => (
                <p key={i} className={cn('break-words', i === 0 && 'font-semibold')}>
                  {line.startsWith(PHONE_PREFIX) ? (
                    <>
                      {PHONE_PREFIX}
                      <span className="text-[#6ab3f3]">{line.slice(PHONE_PREFIX.length)}</span>
                    </>
                  ) : (
                    line
                  )}
                </p>
              ))}
              <p className="mt-0.5 text-right text-[11px] leading-none text-[#6d7f8f]">{time}</p>
            </div>
          )}
        </div>

        {/* Поле ввода — для узнаваемости (неактивно) */}
        <div aria-hidden className="flex items-center gap-3 bg-[#17212b] px-3.5 py-2.5 text-sm text-[#6d7f8f]">
          <span className="flex-1">Сообщение</span>
          <span className="text-base leading-none">😊</span>
        </div>
      </div>

      <button type="button" onClick={onSwitchMode} className={cn(btnGlass, 'mt-4 h-12 w-full px-4 text-sm')}>
        <span className="min-w-0 truncate">🔄 Протестировать другой режим (LITE / PRO)</span>
      </button>
    </div>
  )
}
