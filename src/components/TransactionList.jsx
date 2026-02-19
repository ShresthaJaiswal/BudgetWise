import TransactionCard from './TransactionCard'

// ─── TransactionList ──────────────────────────────────────────────────────────
// Prop drilling LEVEL 1: receives `transactions`, `onEdit`, `onDelete` from Dashboard
// Passes each transaction + handlers down to TransactionCard (level 2)

export default function TransactionList({ transactions, onEdit, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">💸</div>
        <p className="text-slate-400 text-sm">No transactions found.</p>
        <p className="text-slate-300 dark:text-slate-500 text-xs mt-1">
          Add one using the form!
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
      {transactions.map(transaction => (
        // Prop drilling: each transaction + handlers passed to TransactionCard
        <TransactionCard
          key={transaction.id}
          transaction={transaction} // level 2 drilling
          onEdit={onEdit}           // handler drilled through
          onDelete={onDelete}       // handler drilled through
        />
      ))}
    </div>
  )
}
