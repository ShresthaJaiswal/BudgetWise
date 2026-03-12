export default function Toast({ toasts, removeToast }) {
  if (toasts.length === 0) return null

  const styles = {
    success: 'bg-emerald-500 text-white',
    error: 'bg-rose-500 text-white',
    warn: 'bg-amber-500 text-white',
    info: 'bg-blue-500 text-white',
  }

  const icons = {
    success: '✓',
    error: '✕',
    warn: '⚠',
    info: 'ℹ',
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-in min-w-[260px] max-w-sm ${styles[t.type]}`}>
          <span className="text-base">{icons[t.type]}</span>
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="opacity-70 hover:opacity-100 text-lg leading-none">
            ×
          </button>
        </div>
      ))}
    </div>
  )
}