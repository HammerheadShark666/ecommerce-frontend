import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../../app/api.error-handler";

import {
  isApiValidationError,
} from "../../../../app/api.errors";

import {
  useGetTwoFactorStatusQuery,
  useResetPasswordMutation,
} from "./password-reset.api";

const resetPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),

  newPassword: z
    .string()
    .min(8, "Please enter a new password"),

  code: z
    .string()
    .regex(/^\d{6}$/, "Please enter a valid 6 digit code")
    .optional(),
});

type ResetPasswordForm = z.infer<
  typeof resetPasswordSchema
>;

export default function ResetPasswordPage() {

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const {
    data: twoFactorData,
    isLoading: isCheckingTwoFactor,
    error: twoFactorError,
  } = useGetTwoFactorStatusQuery(token ?? "", {
    skip: !token,
  });

  const [
    resetPassword,
    {
      isLoading: isResettingPassword,
      error: resetPasswordError,
      isSuccess,
    },
  ] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const twoFactorEnabled =
    twoFactorData?.isEnabled === true;
 

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      return;
    }

    if (twoFactorEnabled && !data.code) {
      setError("code", {
        type: "required",
        message: "Please enter your 6 digit verification code",
      });
      return;
    }

    try {
      await resetPassword({
        token,
        email: data.email,
        newPassword: data.newPassword,
        ...(twoFactorEnabled && data.code
          ? { code: data.code }
          : {}),
      }).unwrap();
    } catch (error) {

      if (typeof error === "object" && error !== null && "data" in error) {
        const data = error.data;

        if (isApiValidationError(data)) {
          Object.entries(data.errors).forEach(([field, messages]) => {
            if (messages.length > 0) {
              setError(field as keyof ResetPasswordForm, {
                type: "server",
                message: messages[0],
              });
            }
          });
        }
      }
    }
  };

  const errorMessage = getApiErrorMessage(
  resetPasswordError ?? twoFactorError
);

  if (!token) {
    return (
      <main>
        <div>
          <h1>Reset Password</h1>

          <p role="alert">
            Invalid or missing password reset token.
          </p>
        </div>
      </main>
    );
  }

  if (isCheckingTwoFactor) {
    return (
      <main>
        <div>
          <h1>Reset Password</h1>

          <p>Checking your account...</p>
        </div>
      </main>
    );
  }

  if (twoFactorError) {
    return (
      <main>
        <div>
          <h1>Reset Password</h1>

          <p role="alert">
            {getApiErrorMessage(twoFactorError) ??
              "Unable to verify this password reset link."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div>
        <h1>Reset Password</h1>

        {isSuccess ? (
          <div>
            <p role="status">
              Your password has been changed successfully.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div>
            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
            />

            {errors.email && (
              <p role="alert">
                {errors.email.message}
              </p>
            )}
          </div>


            <div>
              <label htmlFor="newPassword">
                New password
              </label>

              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...register("newPassword")}
              />

              {errors.newPassword && (
                <p role="alert">
                  {errors.newPassword.message}
                </p>
              )}
 
            </div>

            {twoFactorEnabled && (
              <div>
                <label htmlFor="code">
                  6 digit verification code
                </label>

                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  {...register("code")}
                />

                {errors.code && (
                  <p role="alert">
                    {errors.code.message}
                  </p>
                )}
              </div>
            )}
         
           {errorMessage && (
            <p role="alert">
              {errorMessage}
            </p>
           )}

            <button
              type="submit"
              disabled={isResettingPassword}
            >
              {isResettingPassword
                ? "Changing password..."
                : "Change password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}