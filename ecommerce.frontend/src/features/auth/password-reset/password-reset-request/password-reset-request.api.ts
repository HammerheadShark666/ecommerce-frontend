import { api } from "../../../../app/api";
import type { PasswordResetRequest, PasswordResetResponse } from "./password-reset-request.types";

export const passwordResetRequestApi = api.injectEndpoints({
  endpoints: (builder) => ({
    passwordResetRequest: builder.mutation<PasswordResetResponse, PasswordResetRequest>({
      query: (requestEmail) => ({
        url: "/forgotten-password",
        method: "POST",
        body: requestEmail,
      }),
    }),
  }),
});

export const {
  usePasswordResetRequestMutation,
} = passwordResetRequestApi;