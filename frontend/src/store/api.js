// manages SERVER state (fetching/mutating from backend)

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setToken, clearUser } from './slices/authSlice'

// Every request automatically attaches the token from localStorage
const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',  // ← add this — sends cookies cross-origin
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`)
        }
        return headers;
    }
})

// wrapper that handles 401 by refreshing token automatically
const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)

    if (result.error?.status === 401) {
        // try to get a new access token
        const refreshResult = await baseQuery(
            { url: '/auth/refresh', method: 'POST' },
            api,
            extraOptions
        )

        if (refreshResult.data) {
            // store new access token
            api.dispatch(setToken(refreshResult.data.accessToken))
            // retry original request with new token
            result = await baseQuery(args, api, extraOptions)
        } else {
            // refresh failed — log user out
            api.dispatch(clearUser())
        }
    }

    return result
}

// baseApi creation
export const budgetwiseApi = createApi({
    reducerPath: 'budgetwiseApi',
    baseQuery: baseQueryWithReauth,  // ← use wrapper instead of plain baseQuery
    tagTypes: ['Transaction', 'Groups'], // for cache invalidation
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

        // password reset
        forgotPassword: builder.mutation({
            query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
        }),
        verifyOtp: builder.mutation({
            query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body }),
        }),
        resetPassword: builder.mutation({
            query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
        }),

        // stats for About page
        getStats: builder.query({
            query: () => '/stats',
        }),

        // custom groups
        getGroups: builder.query({
            query: () => '/groups',
            providesTags: ['Groups'],
        }),
        createGroup: builder.mutation({
            query: (body) => ({ url: '/groups', method: 'POST', body }),
            invalidatesTags: ['Groups'],
        }),
        renameGroup: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/groups/${id}`, method: 'PATCH', body }),
            invalidatesTags: ['Groups'],
        }),
        addTransactionToGroup: builder.mutation({
            query: ({ groupId, transaction_id }) => ({
                url: `/groups/${groupId}/transactions`,
                method: 'POST',
                body: { transaction_id }
            }),
            invalidatesTags: ['Groups']
        }),
        removeTransactionFromGroup: builder.mutation({
            query: ({ groupId, txnId }) => ({
                url: `/groups/${groupId}/transactions/${txnId}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Groups']
        }),
        deleteGroup: builder.mutation({
            query: (id) => ({ url: `/groups/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Groups'],
        })
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
    useForgotPasswordMutation,
    useVerifyOtpMutation,
    useResetPasswordMutation,
    useGetStatsQuery,
    useGetGroupsQuery,
    useCreateGroupMutation,
    useRenameGroupMutation,
    useAddTransactionToGroupMutation,
    useRemoveTransactionFromGroupMutation,
    useDeleteGroupMutation
} = budgetwiseApi