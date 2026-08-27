import { configureStore } from "@reduxjs/toolkit";

import loginReducer from "../features/auth/login/login.slice";
import passwordResetRequestReducer from "../features/auth/password-reset/password-reset-request/password-reset-request.slice";

import { api } from "./api";

export const store = configureStore({
  reducer: {
    login: loginReducer,
    passwordResetRequest: passwordResetRequestReducer,
    [api.reducerPath]: api.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;