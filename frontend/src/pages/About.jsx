import { useGetStatsQuery } from '../store/api'

const features = [
  // built
  { name: 'JWT Authentication', active: true, desc: 'Secure login and registration' },
  { name: 'Password Reset via OTP', active: true, desc: 'Email OTP via Amazon SES' },
  { name: 'Income & Expense Tracking', active: true, desc: 'Add, edit, soft delete transactions' },
  { name: 'Smart Filters', active: true, desc: 'Filter by type, category, date, custom range' },
  { name: 'CSV Export', active: true, desc: 'Export filtered transactions' },
  { name: 'Dark Mode', active: true, desc: 'Persistent theme preference' },
  { name: 'Financial Summary', active: true, desc: 'Monthly chart and category breakdown' },
  { name: 'CloudWatch Logging', active: true, desc: 'Structured error logging via AWS' },
  { name: 'Multi-currency Support', active: true, desc: 'INR, USD, EUR, GBP' },
  // upcoming
  { name: 'Budget Goals', active: false, desc: 'Set monthly spending limits per category' },
  { name: 'Recurring Transactions', active: false, desc: 'Auto-log repeating income/expenses' },
  { name: 'PDF Reports', active: false, desc: 'Download monthly financial reports' },
  { name: 'Mobile App', active: false, desc: 'React Native companion app' },
]

const techStack = [
  { layer: 'Frontend', items: ['React 18', 'Redux Toolkit', 'RTK Query', 'Tailwind CSS', 'Vite'] },
  { layer: 'Backend', items: ['Node.js', 'Express', 'Prisma ORM', 'PostgreSQL'] },
  { layer: 'Auth & Security', items: ['JWT', 'bcryptjs', 'OTP via Amazon SES'] },
  { layer: 'Infra & Logging', items: ['AWS CloudWatch', 'Winston', 'AWS SDK v3'] },
]

export default function About() {
  const { data: stats, isLoading: statsLoading } = useGetStatsQuery()

  const activeFeatures = features.filter(f => f.active)
  const upcomingFeatures = features.filter(f => !f.active)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-slate-800 dark:text-slate-100">
          About BudgetWise
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          A full-stack personal finance tracker built with React, Node.js, and PostgreSQL.
        </p>
      </div>

      {/* ── DB Stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statsLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="card p-4 text-center animate-pulse">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3 mx-auto" />
            </div>
          ))
        ) : (
          <>
            <div className="card p-4 text-center">
              <p className="font-display font-bold text-3xl text-emerald-500">{stats?.transactionCount ?? '—'}</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Transactions</p>
            </div>
            <div className="card p-4 text-center">
              <p className="font-display font-bold text-3xl text-emerald-500">{stats?.userCount ?? '—'}</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Users</p>
            </div>
            <div className="card p-4 text-center">
              <p className="font-display font-bold text-xl text-emerald-500 truncate">{stats?.topCategory ?? '—'}</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Top Category</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* ── Built Features ──────────────────────────────────────────────── */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-slate-800 dark:text-slate-100 mb-4">
            ✅ Features Built
            <span className="ml-2 text-xs text-slate-400 font-normal">
              {activeFeatures.length} features
            </span>
          </h2>
          <div className="space-y-3">
            {activeFeatures.map(f => (
              <div key={f.name} className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5 text-sm">✓</span>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{f.name}</p>
                  <p className="text-xs text-slate-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">

          {/*Coming Soon */}
          <div className="card p-5">
            <h2 className="font-display font-semibold text-slate-800 dark:text-slate-100 mb-4">
              🚧 Coming Soon
              <span className="ml-2 text-xs text-slate-400 font-normal">
                {upcomingFeatures.length} planned
              </span>
            </h2>
            <div className="space-y-3">
              {upcomingFeatures.map(f => (
                <div key={f.name} className="flex items-start gap-2 opacity-60">
                  <span className="text-slate-400 mt-0.5 text-sm">○</span>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{f.name}</p>
                    <p className="text-xs text-slate-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
          {/* Tech Stack */}
          <div className="card p-5">
            <h2 className="font-display font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-4">
              🛠 Tech Stack
            </h2>
            <div className="space-y-3">
              {techStack.map(t => (
                <div key={t.layer}>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t.layer}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {t.items.map(item => (
                      <span
                        key={item}
                        className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}