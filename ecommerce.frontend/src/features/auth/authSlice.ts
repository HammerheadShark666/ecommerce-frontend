import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  accessToken: string | null;
  pendingToken: string | null;
  pendingTokenId: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  pendingToken: null,
  pendingTokenId: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.pendingToken = null;
      state.pendingTokenId = null;
    },

    setTwoFactorPending: (
      state,
      action: PayloadAction<{
        pendingToken: string;
        pendingTokenId: string;
      }>
    ) => {
      state.accessToken = null;
      state.pendingToken = action.payload.pendingToken;
      state.pendingTokenId = action.payload.pendingTokenId;
    },

    logout: (state) => {
      state.accessToken = null;
      state.pendingToken = null;
      state.pendingTokenId = null;
    },
  },
});

export const {
  setCredentials,
  setTwoFactorPending,
  logout,
} = authSlice.actions;

export default authSlice.reducer;