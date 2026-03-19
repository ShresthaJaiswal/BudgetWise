import { useState } from 'react'
import { useBudget } from '../hooks/useBudget'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'
import { useGetTransactionQuery, useAddTransactionMutation, useEditTransactionMutation, useDeleteTransactionMutation, useGetTypesQuery, useGetCategoriesQuery, useGetGroupsQuery } from '../store/api'
import { useDispatch, useSelector } from 'react-redux'
import { setFilter, setSearch, setCategoryFilter, setDateFilter, setSortOrder, setCustomStartDate, setCustomEndDate } from '../store/slices/transactionSlice'
import { setShowWelcome } from '../store/slices/authSlice'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../hooks/useToast'
import { useEffect, useRef } from 'react'
import GroupModal from '../components/GroupModal'
import { exportToCSV, exportToPDF } from '../utils/export'

// Prop drilling ROOT — computed values from useBudget passed down from here

export default function Dashboard() {
  const user = useSelector(state => state.auth.user)

  const dispatch = useDispatch()

  // from Redux slice (local UI state)
  const { filter, search, categoryFilter, dateFilter, sortOrder, customStartDate, customEndDate } = useSelector(state => state.transactions)

  // Server state — from backend via RTK Query
  const { data: types = [] } = useGetTypesQuery()
  const { data: categories = [] } = useGetCategoriesQuery()
  const { data: transactions = [], isLoading } = useGetTransactionQuery(undefined, {
    skip: !user  // ← don't fetch if logged out
  })
  const [addTransaction] = useAddTransactionMutation()
  const [editTransaction] = useEditTransactionMutation()
  const [deleteTransaction] = useDeleteTransactionMutation()
  const { data: groups = [] } = useGetGroupsQuery()

  // Computed values from useBudget (pure useMemo hook)
  const { filteredTransactions } = useBudget(
    transactions,
    filter,
    search,
    categoryFilter,
    dateFilter,
    sortOrder, customStartDate, customEndDate
  )

  // Local UI state: which transaction is being edited
  const [editData, setEditData] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const { toasts, addToast, removeToast } = useToast()
  // confirm dialog state
  const [confirmState, setConfirmState] = useState({ isOpen: false, id: null })
  const [duplicateWarning, setDuplicateWarning] = useState({ isOpen: false, pendingData: null })

  const showWelcome = useSelector(state => state.auth.showWelcome)
  useEffect(() => {
    if (showWelcome) {
      addToast(`Welcome ${user.name}!`, 'success')
      dispatch(setShowWelcome(false))  // ← clear it so it doesn't show again
    }
    if (user?.transactions?.length === 0) {
      addToast('Start recording your daily expenses or income now!', 'info')
    } // error happens because user.transactions is undefined when the component first renders.
    // React renders once before your data finishes loading, so at that moment:
    // user = { ... }      // exists
    // user.transactions = undefined

    // Then this line crashes: user.transactions.length
    // because you're trying to read .length of undefined.
  }, [showWelcome, user])

  const handleSubmit = async (data) => {
    try {
      if (editData) {
        await editTransaction({ id: editData.id, ...data }).unwrap()
        setEditData(null)
        addToast('Transaction updated successfully', 'success')
      } else {
        await addTransaction(data).unwrap() // no need to manually update state — invalidatesTags does it automatically
        addToast('Transaction added successfully', 'success')
      }
    } catch (err) {
      if (err.status === 409) {
        // duplicate detected — ask user if they want to proceed
        setDuplicateWarning({ isOpen: true, pendingData: data })
      } else {
        addToast(err.data?.message || 'Transaction error', 'error')
      }
    }
  }

  // force add despite duplicate
  const handleForceAdd = async () => {
    try {
      await addTransaction({ ...duplicateWarning.pendingData, force: true }).unwrap()
      addToast('Transaction added', 'success')
      setDuplicateWarning({ isOpen: false, pendingData: null })
    } catch (err) {
      addToast(err.data?.message || 'Something went wrong', 'error')
    }
  }

  const handleCancelEdit = () => setEditData(null)

  // custom confirm dialog
  const handleDelete = (id) => {
    setConfirmState({ isOpen: true, id })
  }
  const handleConfirmDelete = async () => {
    try {
      await deleteTransaction(confirmState.id).unwrap()
      addToast('Transaction deleted', 'success')
    } catch (err) {
      addToast('Failed to delete transaction', 'error')
    } finally {
      setConfirmState({ isOpen: false, id: null })
    }
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-800 dark:text-slate-100">
          {greeting()}, {user?.name} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Here's your financial overview.</p>
      </div>

      {/* <div className="mb-6">
        <SummaryCards
          // drilled from useMemo
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          balance={balance}
        />
      </div> */}

      <div className="grid grid-cols-2 gap-4 mb-6">
        {groups.map(g => (
          <div
            key={g.id}
            onClick={() => setSelectedGroup(g)}
            className="card p-4 cursor-pointer hover:shadow-md transition-all">
            <p className="font-display font-semibold text-slate-800 dark:text-slate-100 mb-1">{g.name}</p>
            <p className="text-xs text-slate-400 mb-2">{g._count.transactions} transaction{g._count.transactions !== 1 ? 's' : ''}</p>
            <p className={`text-lg font-bold ${g.net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {g.net >= 0 ? '+' : ''}₹{Math.abs(g.net).toLocaleString('en-IN')}
            </p>
          </div>
        ))}

        <div
          onClick={() => setSelectedGroup({ isNew: true })}
          className="card p-4 cursor-pointer border-dashed hover:shadow-md transition-all flex items-center justify-center">
          <p className="text-slate-400 text-sm">+ New group</p>
        </div>
      </div>

      {selectedGroup && (
        <GroupModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          allTransactions={transactions}
          addToast={addToast}
        />
      )}

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
                <select
                  className="text-xs px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border-none outline-none"
                  value=""
                  onChange={e => {
                    if (e.target.value === 'csv') exportToCSV(filteredTransactions)
                    if (e.target.value === 'pdf') exportToPDF(filteredTransactions, user)
                  }}>
                  <option value="" disabled>↓ Export</option>
                  <option value="csv">Export CSV</option>
                  <option value="pdf">Export PDF</option>
                </select>
              </div>

              <input
                type="text"
                className="input-field text-sm mb-2"
                placeholder="Search transactions..."
                value={search}
                onChange={e => dispatch(setSearch(e.target.value))}
              />

              <div className="flex gap-1.5 flex-wrap">
                {['all', ...types.map(t => t.name)].map(f => (
                  <button
                    key={f}
                    onClick={() => dispatch(setFilter(f))}
                    className={`text-xs px-3 py-1 rounded-full capitalize font-medium transition-all ${filter === f
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
                  onChange={e => dispatch(setCategoryFilter(e.target.value))}
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>

                <select
                  className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-none outline-none"
                  value={dateFilter}
                  onChange={e => dispatch(setDateFilter(e.target.value))}>
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
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

                <select
                  className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-none outline-none"
                  value={sortOrder}
                  onChange={e => dispatch(setSortOrder(e.target.value))}>
                  <option value="newest">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Transaction List — prop drilling chain starts here */}
            <div className="max-h-[460px] overflow-y-auto p-2">
              <TransactionList
                // drilled down (level 1)
                transactions={filteredTransactions}
                // handlers drilled down
                onEdit={setEditData}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        message="Are you sure you want to delete this transaction?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmState({ isOpen: false, id: null })}
      />

      {/* Duplicate warning dialog */}
      <ConfirmDialog
        isOpen={duplicateWarning.isOpen}
        message="A similar transaction was logged in the last 24 hours. Add it anyway?"
        onConfirm={handleForceAdd}
        onCancel={() => setDuplicateWarning({ isOpen: false, pendingData: null })}
      />

      {/* Toast container */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
