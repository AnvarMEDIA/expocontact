'use client';

/**
 * Error boundary для локали — перехватывает любые ошибки рендера.
 */
export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div
          className="font-black text-2xl mb-6"
          style={{ fontFamily: 'sans-serif' }}
        >
          EXPO<span style={{ color: '#D4A843' }}>CONTACT</span>
        </div>

        <h2 className="text-white text-xl font-bold mb-3">
          Что-то пошло не так
        </h2>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          {error?.message || 'Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.'}
        </p>

        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl font-bold text-sm transition-colors"
          style={{ background: '#D4A843', color: '#0A0F1E' }}
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
