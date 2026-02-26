import { configureStore } from '@reduxjs/toolkit'
import { budgetwiseApi } from './api'
import transactionReducer from './slices/transactionSlice'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer, // ← auth state (token + user info)
    transactions: transactionReducer, // ← local UI state
    [budgetwiseApi.reducerPath]: budgetwiseApi.reducer, // ← server state cache
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(budgetwiseApi.middleware),
})