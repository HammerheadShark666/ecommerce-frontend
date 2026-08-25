import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import type { RootState } from "./store";

export const api = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: "include",

    prepareHeaders: (headers, { getState }) => {
     
      const state = getState() as RootState;      

      const token = state.auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  endpoints: () => ({}),
});