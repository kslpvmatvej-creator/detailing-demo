import { DAYS_AHEAD, BUFFER_MIN, addDaysKey, bizDateKey, dayStartMs } from './availability'
import type { BusyInterval } from './slots'

/**
 * ДЕМО-занятость боксов. Никаких запросов в сеть: расписание «чужих» записей генерируется
 * здесь же, детерминированно (одна и та же дата всегда даёт один и тот же день), поэтому
 * слоты выглядят живыми, но демо нельзя ни сломать, ни заспамить.
 * Записи, которые посетитель «оформляет» в демо, добавляются в память и пропадают после перезагрузки.
 */

const MIN = 60_000

/** Небольшой детерминированный генератор случайных чисел (mulberry32) */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hashKey = (key: string) => {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619)
  return h >>> 0
}

type Block = { startMin: number; durMin: number }

/** Занятость одного дня: боксы 1 и 2 — мойка (короткие записи), бокс 3 — детейлинг (долгие работы) */
function dayBlocks(key: string): { boxId: number; startMin: number; durMin: number }[] {
  const rand = rng(hashKey(key))
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)]
  const out: { boxId: number; startMin: number; durMin: number }[] = []

  // Мойка: 2–5 записей на бокс, без пересечений (с учётом подготовки поста)
  for (const boxId of [1, 2]) {
    const placed: Block[] = []
    const want = 2 + Math.floor(rand() * 4)
    for (let attempt = 0; attempt < 24 && placed.length < want; attempt++) {
      const durMin = pick([60, 75, 90, 120, 150])
      const startMin = 10 * 60 + Math.floor(rand() * 22) * 30 // 10:00 … 20:30
      if (startMin + durMin > 23 * 60) continue
      const clash = placed.some(
        (b) => startMin < b.startMin + b.durMin + BUFFER_MIN && b.startMin < startMin + durMin + BUFFER_MIN
      )
      if (clash) continue
      placed.push({ startMin, durMin })
    }
    for (const b of placed) out.push({ boxId, ...b })
  }

  // Детейлинг (бокс 3): один из типов дня
  const r = rand()
  if (r < 0.3) {
    // свободный день
  } else if (r < 0.65) {
    // утренняя работа: после неё остаётся вторая половина дня
    out.push({ boxId: 3, startMin: pick([10 * 60, 10 * 60 + 30]), durMin: pick([180, 240, 300, 360]) })
  } else if (r < 0.9) {
    // вечерняя работа: утро свободно
    out.push({ boxId: 3, startMin: pick([17 * 60, 17 * 60 + 30, 18 * 60]), durMin: pick([120, 180, 240]) })
  } else {
    // бокс занят почти весь день
    out.push({ boxId: 3, startMin: 10 * 60, durMin: 480 })
    out.push({ boxId: 3, startMin: 18 * 60 + 30, durMin: 180 })
  }
  return out
}

const toInterval = (key: string, b: { boxId: number; startMin: number; durMin: number }): BusyInterval => {
  const start = dayStartMs(key) + b.startMin * MIN
  return {
    box_id: b.boxId,
    start_at: new Date(start).toISOString(),
    // busy_until уже включает подготовку поста — как в реальной базе
    busy_until: new Date(start + (b.durMin + BUFFER_MIN) * MIN).toISOString(),
  }
}

/** Записи, оформленные посетителем в этой сессии */
const sessionBookings: BusyInterval[] = []

/** Занять бокс после «успешной» заявки: слот пропадёт из выдачи до перезагрузки страницы */
export function addDemoBooking(boxId: number, startIso: string, busyUntilIso: string) {
  sessionBookings.push({ box_id: boxId, start_at: startIso, busy_until: busyUntilIso })
}

/** Занятость всех боксов на всё окно записи. Имитирует запрос к серверу (короткая задержка), сети нет */
export async function fetchBusy(): Promise<BusyInterval[]> {
  const today = bizDateKey(Date.now())
  const list: BusyInterval[] = []
  for (let i = -1; i <= DAYS_AHEAD + 1; i++) {
    const key = addDaysKey(today, i)
    for (const b of dayBlocks(key)) list.push(toInterval(key, b))
  }
  await new Promise((resolve) => window.setTimeout(resolve, 120))
  return [...list, ...sessionBookings]
}
