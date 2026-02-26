// manages LOCAL state (filter, search, editData)
// local state — never hits backend
// filter: 'all'
// search: ''
// categoryFilter: 'all'

import {createSlice} from '@reduxjs/toolkit'

const transactionSlice = createSlice({
    name: 'transaction',
    initialState: {
        // token: localStorage.getItem('token') || null,
        // The token doesn't belong here because:
        // 1. It's not UI state — we are only holding those
        // 2. Redux resets on refresh — if you stored the token in Redux, every page refresh would wipe it and log the user out
        // 3. RTK Query already handles it — in api.js the prepareHeaders function reads the token from localStorage automatically on every single request
        filter: 'all',
        search: '',
        categoryFilter: 'all',
        dateFilter: 'all',
        sortOrder: 'newest',
    },
    // A reducer is just: A function that takes the current state + an action and returns a new state.
    reducers: {
        setFilter: (state, action) => { state.filter = action.payload },
        setSearch: (state, action) => { state.search = action.payload },
        setCategory: (state, action) => { state.categoryFilter = action.payload },
        setDateFilter: (state, action) => { state.dateFilter = action.payload },
        setSortOrder: (state, action) => { state.sortOrder = action.payload },
        //if updating multiple things or sending an object like in authSlice, use: action.payload.someField
    },
})

export const { setFilter, setSearch, setCategoryFilter, setDateFilter, setSortOrder } = transactionSlice.actions
export default transactionSlice.reducer