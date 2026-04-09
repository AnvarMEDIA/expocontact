/**
 * Skeleton-лоадер для страницы пока она рендерится на сервере.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Пульсирующий логотип */}
        <div className="animate-pulse">
          <span className="font-black text-3xl tracking-tight text-white/20">
            EXPO<span style={{ color: 'rgba(212,168,67,0.3)' }}>CONTACT</span>
          </span>
        </div>
        {/* Прогресс-полоска */}
        <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full animate-pulse"
            style={{ background: 'rgba(212,168,67,0.4)', width: '60%' }}
          />
        </div>
      </div>
    </div>
  );
}
