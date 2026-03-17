// searchable list of ALL user transactions shown inside GroupModal 
// checkmarks on ones already in the group

import { useState } from 'react'

export default function TransactionPicker({ allTransactions, linkedIds, onToggle, onClose }) {
  const [search, setSearch] = useState('')

  const filtered = allTransactions.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Add transactions</p>
        <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600">Done</button>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search transactions..."
        className="input mb-3 px-2 py-1 text-gray-800 rounded-lg bg-slate-200 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
        autoFocus
      />

      <div className="space-y-2 max-h-52 overflow-y-auto">
        {filtered.length === 0
          ? <p className="text-sm text-slate-400 text-center py-3">No transactions found</p>
          : filtered.map(t => {
              const isLinked = linkedIds.includes(t.id)
              return (
                <div
                  key={t.id}
                  onClick={() => onToggle(t)}   // ← just calls onToggle, no mutation
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all
                    ${isLinked ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.description}</p>
                    <p className="text-xs text-slate-400">{t.category.name} · {new Date(t.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${t.type.name === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {t.type.name === 'income' ? '+' : '-'}₹{t.amount}
                    </span>
                    <span className={`text-xs w-5 h-5 rounded-full flex items-center justify-center
                      ${isLinked ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-600'}`}>
                      {isLinked ? '✓' : ''}
                    </span>
                  </div>
                </div>
              )
            })
        }
      </div>
    </div>
  )
}