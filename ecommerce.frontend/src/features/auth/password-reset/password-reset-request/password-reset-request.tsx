import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { usePasswordResetRequestMutation } from "./password-reset-request.api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/layouts/authLayout";

const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),
});

type PasswordResetRequestForm = z.infer<typeof passwordResetRequestSchema>;

export default function PasswordResetRequestPage() {  

  const [message, setMessage] = useState<string | null>(null);
  const [passwordResetRequest, { data, isLoading, error }] = usePasswordResetRequestMutation();

  const {
    register, 
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequestForm>({
    resolver: zodResolver(passwordResetRequestSchema),
  });

  useEffect(() => {
    // Optional: clear sensitive form data when leaving the page.
    return () => {};
  }, []);

  const onSubmit = async (data: PasswordResetRequestForm) => {
    try {
      const result = await passwordResetRequest(data).unwrap();
      setMessage(result.message);
      return;
    } catch {
      // RTK Query exposes the error through `error`.
      // No additional action is required here.
    }
  };

  const getErrorMessage = () => {
    if (!error) {
      return null;
    }

    if ("status" in error) {
      if (typeof error.data === "object" && error.data !== null) {
        const data = error.data as {
          message?: string;
          title?: string;
        };

        return data.message ?? data.title ?? "Password reset request failed.";
      }

      return "Password reset request failed. Please check your email.";
    }

    return "Unable to connect to the server.";
  };

  const errorMessage = getErrorMessage();

  return (
    <AuthLayout title="Request Password Reset">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {data?.message ? (
          <p role="status" className="text-sm text-muted-foreground">
            {data.message}
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />

              {message && (
                <p role="note" className="text-sm text-muted-foreground">
                  {message}
                </p>
              )}

              {errors.email && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {errorMessage && (
              <p role="alert" className="text-sm text-destructive">
                {errorMessage}
              </p>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Sending request..." : "Send Request"}
            </Button>
          </>
        )}
      </form>
    </AuthLayout>
  );
}
