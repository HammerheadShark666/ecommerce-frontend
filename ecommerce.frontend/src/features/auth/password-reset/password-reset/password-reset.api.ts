import { api } from "../../../../app/api";

interface TwoFactorStatusResponse {
  isEnabled: boolean;
}

interface ResetPasswordRequest {
  token: string;
  email: string;
  newPassword: string;
  code?: string | null;
}

interface ResetPasswordResponse {
  message: string;
}

export const passwordResetApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTwoFactorStatus: builder.query<
      TwoFactorStatusResponse,
      string
    >({
      query: (token) => ({
        url: "/2fa/status/token",
        method: "GET",
        params: {
          token,
        },
      }),
    }),

    resetPassword: builder.mutation<
      ResetPasswordResponse,
      ResetPasswordRequest
    >({
      query: (request) => ({
        url: "/forgotten-password/reset/validate",
        method: "POST",
        body: request,
      }),
    }),
  }),
});

export const {
  useGetTwoFactorStatusQuery,
  useResetPasswordMutation,
} = passwordResetApi;