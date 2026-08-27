import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "@/app/api.error-handler";

import { isApiValidationError } from "@/app/api.errors";

import {
  useGetTwoFactorStatusQuery,
  useResetPasswordMutation,
} from "./password-reset.api";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/layouts/authLayout";
import { cn } from "@/lib/utils";

const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),

  newPassword: z.string().min(8, "Please enter a new password"),

  code: z
    .string()
    .regex(/^\d{6}$/, "Please enter a valid 6 digit code")
    .optional(),
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    data: twoFactorData,
    isLoading: isCheckingTwoFactor,
    error: twoFactorError,
  } = useGetTwoFactorStatusQuery(token ?? "", {
    skip: !token,
  });

  const [
    resetPassword,
    { isLoading: isResettingPassword, isSuccess },
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

  const twoFactorEnabled = twoFactorData?.isEnabled === true;

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const onSubmit = async (formValues: ResetPasswordForm) => {
    if (!token) {
      return;
    }

    if (twoFactorEnabled && !formValues.code) {
      setError("code", {
        type: "required",
        message: "Please enter your 6 digit verification code",
      });
      return;
    }

    setGeneralError(null);

    try {
      await resetPassword({
        token,
        email: formValues.email,
        newPassword: formValues.newPassword,
        ...(twoFactorEnabled && formValues.code
          ? { code: formValues.code }
          : {}),
      }).unwrap();
    } catch (error) {
      if (typeof error === "object" && error !== null && "data" in error) {
        const errorData = error.data;

        if (isApiValidationError(errorData)) {
          Object.entries(errorData.errors).forEach(([field, messages]) => {
            if (messages.length > 0) {
              setError(field as keyof ResetPasswordForm, {
                type: "server",
                message: messages[0],
              });
            }
          });
          // Field-level errors are shown inline against each input.
          // Don't also surface them in the general error banner.
          return;
        }
      }

      setGeneralError(
        getApiErrorMessage(error) ?? "Something went wrong. Please try again."
      );
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Reset Password">
        <p role="alert" className="text-sm text-destructive">
          Invalid or missing password reset token.
        </p>
      </AuthLayout>
    );
  }

  if (isCheckingTwoFactor) {
    return (
      <AuthLayout title="Reset Password">
        <p className="text-sm text-muted-foreground">Checking your account...</p>
      </AuthLayout>
    );
  }

  if (twoFactorError) {
    return (
      <AuthLayout title="Reset Password">
        <p role="alert" className="text-sm text-destructive">
          {getApiErrorMessage(twoFactorError) ??
            "Unable to verify this password reset link."}
        </p>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout title="Reset Password">
        <div className="space-y-4 text-center">
          <p role="status" className="text-sm text-muted-foreground">
            Your password has been changed successfully.
          </p>

          <Link to="/login" className={cn(buttonVariants(), "w-full")}>
            Sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p role="alert" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.newPassword}
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p role="alert" className="text-sm text-destructive">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {twoFactorEnabled && (
          <div className="space-y-2">
            <Label htmlFor="code">6 digit verification code</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              aria-invalid={!!errors.code}
              {...register("code")}
            />
            {errors.code && (
              <p role="alert" className="text-sm text-destructive">
                {errors.code.message}
              </p>
            )}
          </div>
        )}

        {generalError && (
          <p role="alert" className="text-sm text-destructive">
            {generalError}
          </p>
        )}

        <Button type="submit" disabled={isResettingPassword} className="w-full">
          {isResettingPassword ? "Changing password..." : "Change password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
