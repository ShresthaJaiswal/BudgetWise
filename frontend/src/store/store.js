import { configureStore } from '@reduxjs/toolkit'
import { budgetwiseApi } from './api'
import transactionReducer from './slices/transactionSlice'

export const store = configureStore({
  reducer: {
    transactions: transactionReducer, // ← local UI state
    [budgetwiseApi.reducerPath]: budgetwiseApi.reducer, // ← server state cache
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(budgetwiseApi.middleware),
})