import { useEffect, useRef, useState } from 'react'
import { useGetCategoriesQuery, useGetTypesQuery } from '../store/api'

export default function TransactionForm({ onSubmit, editData, onCancel }) {

  // Fetch categories and types for the dropdowns
  const { data: categories = [] } = useGetCategoriesQuery()
  const { data: types = [] } = useGetTypesQuery()

  // Local form state with two-way binding
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState(types[0]?.id || null)
  const [category, setCategory] = useState(categories[0]?.id || null)
  const [error, setError] = useState('')

  // auto-focus the description input when the form mounts or edit mode opens
  const descriptionRef = useRef(null)

  // sync form with editData when editing an existing transaction
  useEffect(() => {
    if (editData) {
      setDescription(editData.description)
      setAmount(String(editData.amount))
      setType(editData.type)
      setCategory(editData.category)
    } else {
      setDescription('')
      setAmount('')
      setType(types[0]?.id || null)
      setCategory(categories[0]?.id || null)
    }
    // Auto-focus via ref when form appears
    descriptionRef.current?.focus()
  }, [editData])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!description.trim()) return setError('Please enter a description.')
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return setError('Please enter a valid positive amount.')

    setError('')
    onSubmit({
      ...(editData && { id: editData.id, date: editData.date }),
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category,
    })

    if (!editData) {
      setDescription('')
      setAmount('')
      descriptionRef.current?.focus()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card p-5 animate-slide-in"
    >
      <h2 className="font-display font-semibold text-lg mb-4 text-slate-800 dark:text-slate-100">
        {editData ? 'Edit Transaction' : 'Add Transaction'}
      </h2>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mb-3">
          {error}
        </p>
      )}

      <div className="flex gap-2 mb-4">
        {types.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setType(t.id)} // two-way: updates state on click
            className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
              type === t.id
                ? t.name === 'income'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-rose-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            {t.name === 'income' ? '↑ Income' : '↓ Expense'}
          </button>
        ))}
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          Description
        </label>
        <input
          ref={descriptionRef} // useRef attached here
          type="text"
          className="input-field"
          placeholder="e.g. Grocery run, Freelance payment..."
          value={description}              // controlled: value from state
          onChange={e => setDescription(e.target.value)} // two-way: updates state
        />
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          Amount (₹)
        </label>
        <input
          type="number"
          className="input-field font-mono"
          placeholder="0.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min="0"
          step="1"
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          Category
        </label>
        <select
          className="input-field"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">
          {editData ? 'Save Changes' : 'Add Transaction'}
        </button>
        {editData && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
