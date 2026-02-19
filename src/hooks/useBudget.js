import { useMemo } from 'react'
import { useTransactions, ACTIONS } from '../context/TransactionContext'

export function useBudget() {
  const { state, dispatch } = useTransactions()
  const { transactions, filter, search, categoryFilter } = state

  // Only recalculates when `transactions` changes & not on every render
  const totalIncome = useMemo(
    () =>
      transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  )

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  )

  const balance = useMemo(
    () => totalIncome - totalExpenses,
    [totalIncome, totalExpenses]
  )

  // Filtered + searched transactions — recalculates only when deps change
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => filter === 'all' || t.type === filter)
      .filter(t => categoryFilter === 'all' || t.category === categoryFilter)
      .filter(t =>
        t.description.toLowerCase().includes(search.toLowerCase())
      )
  }, [transactions, filter, search, categoryFilter])

  // Category breakdown for summary page
  const categoryBreakdown = useMemo(() => {
    const breakdown = {}
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        breakdown[t.category] = (breakdown[t.category] || 0) + t.amount
      })
    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [transactions])

  // for the chart
  const monthlyData = useMemo(() => {
    const map = {}
    transactions.forEach(t => {
      const date = new Date(t.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!map[key]) map[key] = { month: key, income: 0, expense: 0 }
      if (t.type === 'income') map[key].income += t.amount
      else map[key].expense += t.amount
    })
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
  }, [transactions])

  // Dispatch helpers
  const addTransaction = (transaction) =>
    dispatch({ type: ACTIONS.ADD, payload: { ...transaction, id: crypto.randomUUID(), date: new Date().toISOString() } })

  const deleteTransaction = (id) =>
    dispatch({ type: ACTIONS.DELETE, payload: id })

  const editTransaction = (transaction) =>
    dispatch({ type: ACTIONS.EDIT, payload: transaction })

  const setFilter = (filter) =>
    dispatch({ type: ACTIONS.SET_FILTER, payload: filter })

  const setSearch = (search) =>
    dispatch({ type: ACTIONS.SET_SEARCH, payload: search })

  const setCategoryFilter = (cat) =>
    dispatch({ type: ACTIONS.SET_CATEGORY_FILTER, payload: cat })

  return {
    // state
    transactions,
    filteredTransactions,
    filter,
    search,
    categoryFilter,
    // computed
    totalIncome,
    totalExpenses,
    balance,
    categoryBreakdown,
    monthlyData,
    // actions
    addTransaction,
    deleteTransaction,
    editTransaction,
    setFilter,
    setSearch,
    setCategoryFilter,
  }
}
