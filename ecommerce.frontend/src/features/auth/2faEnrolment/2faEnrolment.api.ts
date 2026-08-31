import { api } from "../../../app/api";
import type { TwofaEnrolementRequest, TwofaEnrolementResponse, VerifyTwofaResponse, VerifyTwofaRequest, RecoveryCodesResponse, RecoveryCodesRequest } from "./2faEnrolment.types";

export const twofaEnrolmentApi = api.injectEndpoints({
  endpoints: (builder) => ({

    enrolment: builder.mutation<TwofaEnrolementResponse, TwofaEnrolementRequest>({
      query: ({email}) => ({
        url: "/2fa/enrol",
        method: "POST",
        params: {
          email,
        },
      }),
    }),   
    
    verify: builder.mutation<VerifyTwofaResponse, VerifyTwofaRequest>({
      query: (request) => ({
        url: "/2fa/enrol/confirm",
        method: "POST",
        body: request,
      }),
    }),    

    getRecoveryCodes: builder.query<RecoveryCodesResponse, RecoveryCodesRequest>({
      query: ({ email }) => ({
        url: `/auth/2fa/recovery-codes?email=${encodeURIComponent(email)}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
    }),

  }),

});

export const {
  useEnrolmentMutation,
  useVerifyMutation,
  useLazyGetRecoveryCodesQuery,
} = twofaEnrolmentApi;