// ─── TransactionBadge ─────────────────────────────────────────────────────────
// Prop drilling LEVEL 3: receives `category` and `type` drilled from:
//   Dashboard → TransactionList → TransactionCard → TransactionBadge

const categoryColors = {
  'Food & Dining': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Transport': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Shopping': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Housing': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Health': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Entertainment': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'Education': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  'Salary': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Freelance': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Investment': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Other': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

export default function TransactionBadge({ category, type }) {
  // Prop drilling level 3: uses props directly passed down the chain
  const colorClass = categoryColors[category] || categoryColors['Other']

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
      {category}
    </span>
  )
}
