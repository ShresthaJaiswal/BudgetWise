import { useMemo } from 'react'
import { useBudget } from '../hooks/useBudget'
import { useGetTransactionQuery, useGetGroupsQuery } from '../store/api'
import { useSelector, useDispatch } from 'react-redux'
import { setDateFilter, setCustomEndDate, setCustomStartDate } from '../store/slices/transactionSlice'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

function CategoryBreakdown({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-slate-400 text-sm py-8">No expense data yet.</p>
  }

  const total = data.reduce((s, d) => s + d.amount, 0)

  // compute percentages only when data changes
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

export default function Summary() {
  const { data: transactions = [] } = useGetTransactionQuery()
  const { data: groups = [] } = useGetGroupsQuery()

  const dispatch = useDispatch()
  const { filter, search, categoryFilter, dateFilter, sortOrder, customStartDate, customEndDate } = useSelector(state => state.transactions)

  const { categoryBreakdown, monthlyData, totalIncome, totalExpenses, balance, filteredTransactions } = useBudget(
    transactions, filter, search, categoryFilter, dateFilter, sortOrder, customStartDate, customEndDate
  )

  const savingsRate = useMemo(() => {
    if (totalIncome === 0) return 0
    return ((balance / totalIncome) * 100).toFixed(1)
  }, [balance, totalIncome])

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const groupChartData = groups.map(g => ({
    name: g.name,
    transactions: g._count.transactions,
    net: Math.abs(g.net)
  })).filter(g => g.transactions > 0)  // exclude empty groups

  // colors for each slice
  // the colors array is just a palette, not tied to transaction counts. The i % COLORS.length part cycles through it dynamically
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

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

      {/* Insight card */}
      {transactions.length > 0 && (
        <div className="card p-5 mt-6 border-l-4 border-l-emerald-500 animate-fade-in gap-4 mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Chart */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-slate-800 dark:text-slate-100 mb-2">
            Monthly Overview
          </h2>
          <select
            className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-none outline-none mb-2"
            value={dateFilter}
            onChange={e => dispatch(setDateFilter(e.target.value))}>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="6months">Last 6 Months</option>
            <option value="year">Last Year</option>
            <option value="custom">Custom Date</option>
          </select>

          {/* Show date pickers only when custom is selected */}
          {dateFilter === 'custom' && (
            <div className="flex gap-2 mt-2 w-full">
              <input
                type="date"
                className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-none outline-none flex-1"
                value={customStartDate}
                onChange={e => {
                  if (customEndDate && e.target.value > customEndDate) {
                    return setError('Start date cannot be after end date.')
                  }
                  dispatch(setCustomStartDate(e.target.value))
                }}
              />
              <span className="text-xs text-slate-400 self-center">to</span>
              <input
                type="date"
                className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-none outline-none flex-1"
                value={customEndDate}
                onChange={e => {
                  if (customStartDate && e.target.value < customStartDate) {
                    return setError('End date cannot be before start date.')
                  }
                  dispatch(setCustomEndDate(e.target.value))
                }}
              />
            </div>
          )}

          <div className="flex gap-3 text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-400 inline-block" /> Income
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-rose-400 inline-block" /> Expense
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

      {/* Group Distribution */}
        {groupChartData.length > 0 && (
          <div className="card p-5 mt-6">
            <h2 className="font-display font-semibold text-slate-800 dark:text-slate-100 mb-1">
              Group overview
            </h2>
            <p className="text-xs text-slate-400 mb-6">Transaction count per group</p>

            <div className="flex flex-col md:flex-row items-center gap-6">

              {/* donut chart */}
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={groupChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}    // ← makes it a donut
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="transactions"
                    nameKey="name"
                  >
                    {groupChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} transaction${value !== 1 ? 's' : ''}`, '']}
                    contentStyle={{
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#f8fafc',
                      padding: '3px 9px'
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* side table */}
              <div className="w-full md:w-64 space-y-2 shrink-0">
                {groupChartData
                  .sort((a, b) => b.transactions - a.transactions)
                  .map((g, i) => (
                    <div key={g.name} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{g.name}</span>
                      </div>
                      <span className="text-xs text-slate-400 ml-2">{g.transactions} txn{g.transactions !== 1 ? 's' : ''}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
