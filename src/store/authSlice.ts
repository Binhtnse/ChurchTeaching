import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  role: string;
  userName: string;
}

const initialState: AuthState = {
  isLoggedIn: false,
  role: '',
  userName: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthState>) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.role = action.payload.role;
      state.userName = action.payload.userName;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.role = '';
      state.userName = '';
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;