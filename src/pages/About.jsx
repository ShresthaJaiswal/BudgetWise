// ─── About Page ───────────────────────────────────────────────────────────────
// Demonstrates: React Router page, simple static content

const concepts = [
  {
    icon: '🧠',
    hook: 'useState',
    where: 'TransactionForm, Login, Dashboard',
    desc: 'Manages local component state: form fields, edit mode, loading, error messages.',
  },
  {
    icon: '⚡',
    hook: 'useEffect',
    where: 'ThemeContext, AuthContext, TransactionContext, Login',
    desc: 'Syncs dark mode class, rehydrates auth from localStorage, persists transactions, fetches quote via axios on mount.',
  },
  {
    icon: '🌐',
    hook: 'useContext',
    where: 'Navbar, Dashboard, Login, ProtectedRoute',
    desc: 'ThemeContext for dark/light toggle, AuthContext for user session, TransactionContext for global transaction state.',
  },
  {
    icon: '⚙️',
    hook: 'useReducer',
    where: 'TransactionContext',
    desc: 'Manages complex transaction state with typed actions: ADD, DELETE, EDIT, SET_FILTER, SET_SEARCH.',
  },
  {
    icon: '🚀',
    hook: 'useMemo',
    where: 'useBudget hook, Summary page',
    desc: 'Computes totalIncome, totalExpenses, balance, filteredTransactions, categoryBreakdown only when dependencies change.',
  },
  {
    icon: '🎯',
    hook: 'useRef',
    where: 'TransactionForm, Login',
    desc: 'Auto-focuses the description input when form mounts or edit mode activates. No re-render needed.',
  },
  {
    icon: '🔗',
    hook: 'Two-way Binding',
    where: 'TransactionForm, Login',
    desc: 'All inputs use value={state} + onChange={setState} for controlled, predictable form handling.',
  },
  {
    icon: '🪆',
    hook: 'Prop Drilling',
    where: 'Dashboard → TransactionList → TransactionCard → TransactionBadge',
    desc: 'Transactions and handlers are passed 3 levels deep intentionally, showcasing when Context vs props is appropriate.',
  },
  {
    icon: '💾',
    hook: 'localStorage',
    where: 'ThemeContext, AuthContext, TransactionContext',
    desc: 'Theme, user, and all transactions persist across sessions via localStorage, synced with useEffect.',
  },
  {
    icon: '🗺️',
    hook: 'React Router',
    where: 'App.jsx, Navbar',
    desc: 'Routes: /login, /dashboard, /summary, /about. Protected routes redirect unauthenticated users to /login.',
  },
  {
    icon: '📡',
    hook: 'axios',
    where: 'Login page',
    desc: 'Fetches a motivational quote from quotable.io on login page mount. Includes error handling with a fallback.',
  },
]

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 text-center">
        <h1 className="font-display font-bold text-3xl text-slate-800 dark:text-slate-100 mb-2">
          About BudgetWise
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
          A React showcase project demonstrating core hooks, patterns, and architecture
          through a real-world budget tracking application.
        </p>
      </div>

      {/* Tech stack badges */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {['React 18', 'Tailwind CSS', 'axios', 'React Router v6', 'Vite'].map(t => (
          <span
            key={t}
            className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Concepts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {concepts.map((c) => (
          <div key={c.hook} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{c.icon}</span>
              <div>
                <h3 className="font-mono font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                  {c.hook}
                </h3>
                <p className="text-xs text-slate-400 mb-1">{c.where}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {c.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400 mt-8">
        Built with React + Tailwind CSS · All data stored locally in your browser
      </p>
    </div>
  )
}
