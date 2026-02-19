import { useMemo } from 'react'
import { useBudget } from '../hooks/useBudget'

// ─── Simple bar chart using pure CSS/Tailwind ─────────────────────────────────
function BarChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-slate-400 text-sm py-8">No data yet.</p>
  }

  const max = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1)

  return (
    <div className="flex items-end gap-3 h-40 pt-4">
      {data.map((d) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex gap-1 items-end h-32">
            {/* Income bar */}
            <div
              className="flex-1 bg-emerald-400 dark:bg-emerald-500 rounded-t-md transition-all duration-700"
              style={{ height: `${(d.income / max) * 100}%` }}
              title={`Income: ₹${d.income}`}
            />
            {/* Expense bar */}
            <div
              className="flex-1 bg-rose-400 dark:bg-rose-500 rounded-t-md transition-all duration-700"
              style={{ height: `${(d.expense / max) * 100}%` }}
              title={`Expense: ₹${d.expense}`}
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">{d.month.slice(5)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Category pie-like display ────────────────────────────────────────────────
function CategoryBreakdown({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-slate-400 text-sm py-8">No expense data yet.</p>
  }

  const total = data.reduce((s, d) => s + d.amount, 0)

  // useMemo: compute percentages only when data changes
  const withPct = useMemo(
    () => data.map(d => ({ ...d, pct: ((d.amount / total) * 100).toFixed(1) })),
    [data, total]
  )

  const colors = [
    'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500',
    'bg-rose-500', 'bg-teal-500', 'bg-yellow-500', 'bg-cyan-500',
  ]

  return (
    <div className="space-y-3">
      {withPct.map((d, i) => (
        <div key={d.category}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-slate-600 dark:text-slate-300">{d.category}</span>
            <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
              {d.pct}%
            </span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-700`}
              style={{ width: `${d.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Summary Page ─────────────────────────────────────────────────────────────
export default function Summary() {
  const {
    totalIncome,
    totalExpenses,
    balance,
    categoryBreakdown,
    monthlyData,
    transactions,
  } = useBudget()

  // useMemo: savings rate, only recalculates when income/expenses change
  const savingsRate = useMemo(() => {
    if (totalIncome === 0) return 0
    return ((balance / totalIncome) * 100).toFixed(1)
  }, [balance, totalIncome])

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-800 dark:text-slate-100">
          Financial Summary
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {transactions.length} total transaction{transactions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Income', value: fmt(totalIncome), color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Expenses', value: fmt(totalExpenses), color: 'text-rose-600 dark:text-rose-400' },
          { label: 'Balance', value: fmt(balance), color: balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400' },
          { label: 'Savings Rate', value: `${savingsRate}%`, color: Number(savingsRate) >= 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`font-display font-bold text-lg ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Chart */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-slate-800 dark:text-slate-100 mb-1">
            Monthly Overview
          </h2>
          <p className="text-xs text-slate-400 mb-4">Last 6 months</p>
          <div className="flex gap-3 text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-400 inline-block"/> Income
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-rose-400 inline-block"/> Expense
            </span>
          </div>
          <BarChart data={monthlyData} />
        </div>

        {/* Category Breakdown */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-slate-800 dark:text-slate-100 mb-1">
            Spending by Category
          </h2>
          <p className="text-xs text-slate-400 mb-4">Expenses only</p>
          <CategoryBreakdown data={categoryBreakdown} />
        </div>
      </div>

      {/* Insight card */}
      {transactions.length > 0 && (
        <div className="card p-5 mt-6 border-l-4 border-l-emerald-500 animate-fade-in">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">💡 Quick Insight</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {Number(savingsRate) >= 20
              ? `You're saving ${savingsRate}% of your income — great financial discipline!`
              : Number(savingsRate) > 0
              ? `Your savings rate is ${savingsRate}%. Aim for 20%+ to build a strong financial cushion.`
              : `Your expenses are outpacing your income. Try reducing variable spending.`}
          </p>
        </div>
      )}
    </div>
  )
}
