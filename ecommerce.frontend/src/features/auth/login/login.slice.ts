import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  pendingToken: string | null;
  pendingTokenId: string | null;
  email: string | null;
}

const initialState: AuthState = {
  pendingToken: null,
  pendingTokenId: null,
  email: null,
};

const loginSlice = createSlice({
  name: "login",
  initialState,

  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ email: string }>
    ) => {
      state.pendingToken = null;
      state.pendingTokenId = null;
      state.email = action.payload.email;
    },

    setTwoFactorPending: (
      state,
      action: PayloadAction<{
        pendingToken: string;
        pendingTokenId: string;
        email: string;
      }>
    ) => {
      state.pendingToken = action.payload.pendingToken;
      state.pendingTokenId = action.payload.pendingTokenId;
      state.email = action.payload.email;
    },

    clearPending: (state) => {
      state.pendingToken = null;
      state.pendingTokenId = null;
      state.email = null;
    },
  },
});

export const {
  setCredentials,
  setTwoFactorPending,
  clearPending,
} = loginSlice.actions;

export default loginSlice.reducer;