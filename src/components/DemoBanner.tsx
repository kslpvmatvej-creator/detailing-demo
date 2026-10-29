/** Демо-плашка: закреплена вверху страницы и занимает своё место в потоке, поэтому шапку не перекрывает */
export default function DemoBanner() {
  return (
    <div
      role="note"
      className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/85 px-4 py-2 text-center text-xs leading-snug text-zinc-200 backdrop-blur-xl md:text-[13px]"
    >
      <span className="font-semibold text-white">⚡ Демо-версия системы записи.</span> Нажмите &quot;Записаться&quot;, чтобы
      сравнить режимы LITE и PRO
    </div>
  )
}
