// `useBudget.js` becomes just a `useMemo` computation hook — it reads from RTK Query's data and the Redux slice, but dispatches nothing itself.

import { useMemo } from 'react'

export function useBudget(transactions = [], filter = 'all', search = '', categoryFilter = 'all') {

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

  // Filtered — recalculates only when dependencies change
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
