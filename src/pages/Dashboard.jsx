import { useState } from 'react'
import { useBudget } from '../hooks/useBudget'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from '../components/TransactionForm'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'
import SummaryCards from '../components/SummaryCards'

export default function Dashboard() {
  const { user } = useAuth()

  // All computed values + actions from our custom hook (useMemo lives here)
  const {
    filteredTransactions,
    totalIncome,
    totalExpenses,
    balance,
    filter,
    search,
    categoryFilter,
    addTransaction,
    editTransaction,
    deleteTransaction,
    setFilter,
    setSearch,
    setCategoryFilter,
  } = useBudget()

  // Local state: which transaction is being edited
  const [editData, setEditData] = useState(null)

  const handleEdit = (transaction) => setEditData(transaction)
  const handleCancelEdit = () => setEditData(null)

  const handleSubmit = (data) => {
    if (editData) {
      editTransaction(data)
      setEditData(null)
    } else {
      addTransaction(data)
    }
  }

  const handleDelete = (id) => {
    if (confirm('Delete this transaction?')) deleteTransaction(id)
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-800 dark:text-slate-100">
          {greeting()}, {user?.name} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Here's your financial overview.</p>
      </div>

      <div className="mb-6">
        <SummaryCards
          // drilled from useMemo
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          balance={balance}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Add/Edit Form */}
        <div className="lg:col-span-1">
          <TransactionForm
            onSubmit={handleSubmit}
            editData={editData}
            onCancel={handleCancelEdit}
          />
        </div>

        {/* Right: Transactions List */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            {/* Filters header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-semibold text-slate-800 dark:text-slate-100">
                  Transactions
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  {filteredTransactions.length} result{filteredTransactions.length !== 1 ? 's' : ''}
                </span>
              </div>

              <input
                type="text"
                className="input-field text-sm mb-2"
                placeholder="Search transactions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />

              <div className="flex gap-1.5 flex-wrap">
                {['all', 'income', 'expense'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-xs px-3 py-1 rounded-full capitalize font-medium transition-all ${
                      filter === f
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
                <select
                  className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-none outline-none ml-auto"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Transaction List — prop drilling chain starts here */}
            <div className="max-h-[460px] overflow-y-auto p-2">
              <TransactionList
                // drilled down (level 1)
                transactions={filteredTransactions}
                // handlers drilled down
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
