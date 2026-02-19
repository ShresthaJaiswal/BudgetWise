import { createContext, useContext, useEffect, useReducer } from 'react'

// ─── Action Types ─────────────────────────────────────────────────────────────
export const ACTIONS = {
  LOAD: 'LOAD',
  ADD: 'ADD',
  DELETE: 'DELETE',
  EDIT: 'EDIT',
  SET_FILTER: 'SET_FILTER',
  SET_SEARCH: 'SET_SEARCH',
  SET_CATEGORY_FILTER: 'SET_CATEGORY_FILTER',
}

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  transactions: [],
  filter: 'all',       // 'all' | 'income' | 'expense'
  search: '',
  categoryFilter: 'all',
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function transactionReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD:
      return { ...state, transactions: action.payload }

    case ACTIONS.ADD:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      }

    case ACTIONS.DELETE:
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      }

    case ACTIONS.EDIT:
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      }

    case ACTIONS.SET_FILTER:
      return { ...state, filter: action.payload }

    case ACTIONS.SET_SEARCH:
      return { ...state, search: action.payload }

    case ACTIONS.SET_CATEGORY_FILTER:
      return { ...state, categoryFilter: action.payload }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const TransactionContext = createContext()

export function TransactionProvider({ children }) {
  const [state, dispatch] = useReducer(transactionReducer, initialState)

  // useEffect: load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('budgetwise_transactions')
    if (saved) {
      dispatch({ type: ACTIONS.LOAD, payload: JSON.parse(saved) })
    }
  }, [])

  // useEffect: persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(
      'budgetwise_transactions',
      JSON.stringify(state.transactions)
    )
  }, [state.transactions])

  return (
    <TransactionContext.Provider value={{ state, dispatch }}>
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const ctx = useContext(TransactionContext)
  if (!ctx) throw new Error('useTransactions must be used within TransactionProvider')
  return ctx
}
