import TransactionBadge from './TransactionBadge'

// Prop drilling LEVEL 2: receives full `transaction` object + handlers from TransactionList
// Passes `category` and `type` down to TransactionBadge

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatAmount(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function TransactionCard({ transaction, onEdit, onDelete }) {
  // Destructure the prop-drilled transaction object
  const { id, description, amount, type, category, createdAt } = transaction

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group animate-fade-in">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
          type === 'income'
            ? 'bg-emerald-100 dark:bg-emerald-900/30'
            : 'bg-rose-100 dark:bg-rose-900/30'
        }`}
      >
        {type === 'income' ? '↑' : '↓'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
          {description}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {/* Passing category + type down to TransactionBadge */}
          <TransactionBadge category={category} type={type} />
          <span className="text-xs text-slate-400">{formatDate(createdAt)}</span>
        </div>
      </div>

      <span
        className={`font-mono font-semibold text-sm flex-shrink-0 ${
          type === 'income'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-rose-600 dark:text-rose-400'
        }`}
      >
        {type === 'income' ? '+' : '-'}{formatAmount(amount)}
      </span>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onEdit(transaction)} // handler drilled from Dashboard
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(id)} // handler drilled from Dashboard
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
