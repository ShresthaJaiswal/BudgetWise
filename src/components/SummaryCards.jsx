// ─── SummaryCards ─────────────────────────────────────────────────────────────
// Receives computed values as props from Dashboard (prop drilling level 1)
// These values are computed via useMemo in useBudget hook

function formatAmount(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
}

function StatCard({ label, amount, type, icon }) {
  const colorMap = {
    balance: amount >= 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-rose-600 dark:text-rose-400',
    income: 'text-emerald-600 dark:text-emerald-400',
    expense: 'text-rose-600 dark:text-rose-400',
  }

  return (
    <div className="card p-5 animate-number-pop">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`font-display font-bold text-2xl ${colorMap[type]}`}>
        {type === 'balance' && amount < 0 ? '-' : ''}
        {formatAmount(amount)}
      </p>
    </div>
  )
}

export default function SummaryCards({ totalIncome, totalExpenses, balance }) {
  // All three values are prop-drilled from Dashboard (computed by useMemo)
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard label="Balance" amount={balance} type="balance" icon="⚖️" />
      <StatCard label="Total Income" amount={totalIncome} type="income" icon="📈" />
      <StatCard label="Total Expenses" amount={totalExpenses} type="expense" icon="📉" />
    </div>
  )
}
