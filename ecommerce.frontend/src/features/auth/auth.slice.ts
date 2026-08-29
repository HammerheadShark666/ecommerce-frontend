import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  jwtToken: string | null;
  email: string | null;
}

const initialState: AuthState = {
  jwtToken: null, 
  email: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ jwtToken: string; email: string }>
    ) => {
      state.jwtToken = action.payload.jwtToken;
      state.email = action.payload.email;
    },

    setTwoFactorPending: (
      state,
      action: PayloadAction<{
        email: string;
      }>
    ) => {
      state.jwtToken = null;
      state.email = action.payload.email;
    },

    logout: (state) => {
      state.jwtToken = null;
      state.email = null;
    },
  },
});

export const {
  setCredentials,
  setTwoFactorPending,
  logout,
} = authSlice.actions;

export default authSlice.reducer;