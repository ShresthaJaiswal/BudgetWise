// manages SERVER state (fetching/mutating from backend)

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// baseApi creation
export const budgetwiseApi = createApi({
    reducerPath: 'budgetwiseApi',

    // Every request automatically attaches the token from localStorage
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5000/api',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers;
        }
    }),
    tagTypes: ['User', 'Transaction'], // for cache invalidation
    /* This tells Redux: “Anything labeled Post is now stale.”
    Boom 💥 → automatic refetch.
    No manual refresh. No dispatch. Nothing. */

    /* getTransactions → providesTags: ['Transaction']
    addTransaction → invalidatesTags: ['Transaction']
    deleteTransaction → invalidatesTags: ['Transaction'] */


    // endpoints injected separately
    endpoints: (builder) => ({

        // auth
        register: builder.mutation({
            query: (body) => ({ url: '/auth/register', method: 'POST', body }),
        }),
        login: builder.mutation({
            query: (body) => ({ url: '/auth/login', method: 'POST', body })
        }),

        // transactions
        getTransaction: builder.query({
            query: () => '/transactions', // Because with fetchBaseQuery, GET is the default method
            providesTags: ['Transaction'],
        }),
        addTransaction: builder.mutation({
            query: (body) => ({ url: '/transactions', method: 'POST', body }),
            invalidatesTags: ['Transaction'], // auto refetches list after adding
        }),
        editTransaction: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/transactions/${id}`, method: 'PUT', body }), // Because ${id} is a JavaScript template literal — it only works with backticks, not single or double quotes.
            invalidatesTags: ['Transaction'],
        }),
        deleteTransaction: builder.mutation({
            query: (id) => ({ url: `/transactions/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Transaction'],
        }),
        
        // lookup tables
        getTypes: builder.query({
            query: () => '/types',
        }),
        getCategories: builder.query({
            query: () => '/categories',
        }),
    }),
});

// Auto-generated hooks for each endpoint
export const {
  useRegisterMutation,
  useLoginMutation,
  useGetTransactionQuery,
  useAddTransactionMutation,
  useEditTransactionMutation,
  useDeleteTransactionMutation,
  useGetTypesQuery,
  useGetCategoriesQuery,
} = budgetwiseApi