// `useBudget.js` becomes just a `useMemo` computation hook — it reads from RTK Query's data and the Redux slice, but dispatches nothing itself.

import { useMemo } from 'react'

export function useBudget(transactions = [], filter = 'all', search = '', categoryFilter = 'all', dateFilter = 'all', sortOrder = 'newest') {

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

  const now = new Date()

  // Filtered — recalculates only when dependencies change
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => filter === 'all' || t.type === filter)
      .filter(t => categoryFilter === 'all' || t.category === categoryFilter)
      .filter(t =>
        t.description.toLowerCase().includes(search.toLowerCase())
      )
      .filter(t => {
        if (dateFilter === 'all') return true
        const txDate = new Date(t.createdAt)
        if (dateFilter === 'today') {
          return txDate.toDateString() === now.toDateString()
        }
        if (dateFilter === 'week') {
          const weekAgo = new Date()
          weekAgo.setDate(now.getDate() - 7)
          return txDate >= weekAgo
        }
        if (dateFilter === 'month') {
          return (
            txDate.getMonth() === now.getMonth() &&
            txDate.getFullYear() === now.getFullYear()
          )
        }
        if (dateFilter === 'year') {
          return txDate.getFullYear() === now.getFullYear()
        }
        return true
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt) // It creates a Date object from the timestamp string stored in your transaction. 
        // a.createdAt = "2026-02-25T10:36:29.975Z"
        // new Date(a.date) = Feb 25, 2026, 10:36:29
        const dateB = new Date(b.createdAt)
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
      })
  }, [transactions, filter, search, categoryFilter, dateFilter, sortOrder])

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
      .sort((a, b) => b.amount - a.amount)       // {travel} 5000 - {food} 2000 → positive → Travel first
  }, [transactions])

  // for bar chart — last 6 months
  const monthlyData = useMemo(() => {
    const map = {}
    transactions.forEach(t => {
      const date = new Date(t.createdAt)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!map[key]) map[key] = { month: key, income: 0, expense: 0 }
      if (t.type === 'income') map[key].income += t.amount
      else map[key].expense += t.amount
    })
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
  }, [transactions])
  
  return {
    totalIncome,
    totalExpenses,
    balance,
    filteredTransactions,
    categoryBreakdown,
    monthlyData
  }
}
