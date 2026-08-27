import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface PasswordResetRequestState {
  message: string | null; 
}

const initialState: PasswordResetRequestState = {
  message: null
};

const passwordResetRequestSlice = createSlice({
  name: "passwordResetRequest",
  initialState,

  reducers: {
    setMessage: (
      state,
      action: PayloadAction<{ message: string }>
    ) => {
      state.message = action.payload.message; 
    } 
  },
});

export const {
  setMessage,
} = passwordResetRequestSlice.actions;

export default passwordResetRequestSlice.reducer;