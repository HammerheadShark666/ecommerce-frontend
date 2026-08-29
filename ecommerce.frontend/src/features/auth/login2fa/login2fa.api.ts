import { api } from "../../../app/api";
import type { Login2faRequest, Login2faResponse } from "./login2fa.types";

export const login2faApi = api.injectEndpoints({
  endpoints: (builder) => ({
    verify2faLogin: builder.mutation<Login2faResponse, Login2faRequest>({
      query: (credentials) => ({
        url: "/login/2fa/verify",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const {
  useVerify2faLoginMutation,
} = login2faApi;