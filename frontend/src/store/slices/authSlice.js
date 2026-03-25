import { createSlice } from '@reduxjs/toolkit';

// On app load, check localStorage for saved user + token
// This replaces the useEffect in AuthContext that rehydrated auth
const savedUser = localStorage.getItem('bw_user')

// helper to check expiry upon loading token from localStorage. If expired, clear it so app doesn't think user is logged in when they're not.
const getStoredToken = () => {
  const token = localStorage.getItem('bw_token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('bw_token')
      return null
    }
    return token
  } catch {
    return null
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: getStoredToken(),
    user: savedUser ? JSON.parse(savedUser) : null, // since localStorage always stores data in String format
    showWelcome: false // for welcome message on first login
  },
  reducers: {
    setShowWelcome: (state, action) => { 
      state.showWelcome = action.payload 
    },
    // Called after successful login or register
    setUser: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.showWelcome = true;
      localStorage.setItem('bw_token', action.payload.token);
      localStorage.setItem('bw_user', JSON.stringify(action.payload.user)); // save user to localStorage so auth state persists on refresh
    },
    setToken: (state, action) => {
      state.token = action.payload
      localStorage.setItem('bw_token', action.payload)
    },
    clearUser: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('bw_token');
      localStorage.removeItem('bw_user'); // on next load, authSlice initialState reads bw_user back and thinks you're still logged in — so ProtectedRoute never redirects to login. Removing bw_user on logout fixes this.
      // cached API data from budgetwiseApi and transactionSlice still remains to be cleared on logout
    },
  },
});

export const { setShowWelcome, setUser, clearUser, setToken } = authSlice.actions
export default authSlice.reducer