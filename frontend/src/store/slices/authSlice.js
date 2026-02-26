import { createSlice } from '@reduxjs/toolkit';

// On app load, check localStorage for saved user + token
// This replaces the useEffect in AuthContext that rehydrated auth
const savedUser = localStorage.getItem('bw_user')

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('bw_token') || null,
    user: savedUser ? JSON.parse(savedUser) : null, // since localStorage always stores data in String format
  },
  reducers: {
    // Called after successful login or register
    setUser: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('bw_token', action.payload.token);
      localStorage.setItem('bw_user', JSON.stringify(action.payload.user)); // save user to localStorage so auth state persists on refresh
    },
    clearUser: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('bw_token');
      localStorage.removeItem('bw_user'); // on next load, authSlice initialState reads bw_user back and thinks you're still logged in — so ProtectedRoute never redirects to login. Removing bw_user on logout fixes this.
    },
  },
});

export const { setUser, clearUser } = authSlice.actions
export default authSlice.reducer