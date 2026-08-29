
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useVerify2faLoginMutation } from "./login2fa.api";
import { clearPending } from "../login/login.slice";

import {
  setCredentials 
} from "../auth.slice";
import type { AppDispatch, RootState } from "../../../app/store";
import { AuthLayout } from "@/components/layouts/authLayout";

const twoFactorSchema = z.object({
  code: z
    .string()
    .length(6, "Enter all 6 digits")
    .regex(/^\d{6}$/, "Code must contain digits only"),
});

type TwoFactorForm = z.infer<typeof twoFactorSchema>;

export default function Login2faPage() {

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { email, pendingToken, pendingTokenId } = useSelector(
    (state: RootState) => state.login
  );

  const [verifyTwoFactor, { isLoading, error }] = useVerify2faLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TwoFactorForm>({
    resolver: zodResolver(twoFactorSchema),
  });

  const onSubmit = async (data: TwoFactorForm) => {
    if (!email || !pendingToken || !pendingTokenId) {
      return;
    }

    try {
      const result = await verifyTwoFactor({
        email,
        pendingToken,
        pendingTokenId,
        code: data.code,
      }).unwrap();

      if (!result.jwtToken) {
        throw new Error("Authentication token was not returned.");
      }

      dispatch(
        setCredentials({
          jwtToken: result.jwtToken,
          email,
        })
      );

      dispatch(clearPending()); 

      const fromPathname = location.state?.from?.pathname;
      const excludedPaths = ["/login", "/2fa-authentication"];

      const redirectTo =
        fromPathname && !excludedPaths.includes(fromPathname)
          ? fromPathname
          : "/";

      navigate(redirectTo, { replace: true });      
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

        return data.message ?? data.title ?? "Verification failed.";
      }

      return "Verification failed. Please check the code and try again.";
    }

    return "Unable to connect to the server.";
  };

  const errorMessage = getErrorMessage();

  return (
    <AuthLayout title="Enter verification code">    
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            aria-invalid={!!errors.code}
            autoFocus
            {...register("code")}
          />
          {errors.code && (
            <p role="alert" className="text-sm text-destructive">
              {errors.code.message}
            </p>
          )}
        </div>

        {errorMessage && (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </AuthLayout>
  );
}
