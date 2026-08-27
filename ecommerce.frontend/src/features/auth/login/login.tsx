import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

import { useLoginMutation } from "./login.api";
import {
  setCredentials,
  setTwoFactorPending,
} from "./login.slice";
import type { AppDispatch } from "../../../app/store";
import { AuthLayout } from "@/components/layouts/authLayout";

const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Please enter your password"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const [login, { isLoading, error }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // Optional: clear sensitive form data when leaving the page.
    return () => {};
  }, []);

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await login(data).unwrap();

      if (result.requiresTwoFactor) {
        if (!result.pendingToken || !result.pendingTokenId) {
          throw new Error("Two-factor authentication information is missing.");
        }

        dispatch(
          setTwoFactorPending({
            pendingToken: result.pendingToken,
            pendingTokenId: result.pendingTokenId,
          })
        );

        navigate("/two-factor");
        return;
      }

      if (!result.jwtToken) {
        throw new Error("Authentication token was not returned.");
      }

      dispatch(
        setCredentials({
          accessToken: result.jwtToken,
        })
      );

      const from =
        location.state?.from?.pathname ?? "/account";

      navigate(from, { replace: true });
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

        return data.message ?? data.title ?? "Login failed.";
      }

      return "Login failed. Please check your email and password.";
    }

    return "Unable to connect to the server.";
  };

  const errorMessage = getErrorMessage();

//   return (   
//     <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
//       <Card className="w-full max-w-sm">
//         <CardHeader>
//           <CardTitle className="text-2xl">Sign in</CardTitle>
//         </CardHeader>

//         <CardContent>
//           <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email address</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 autoComplete="email"
//                 aria-invalid={!!errors.email}
//                 {...register("email")}
//               />
//               {errors.email && (
//                 <p role="alert" className="text-sm text-destructive">
//                   {errors.email.message}
//                 </p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 autoComplete="current-password"
//                 aria-invalid={!!errors.password}
//                 {...register("password")}
//               />
//               {errors.password && (
//                 <p role="alert" className="text-sm text-destructive">
//                   {errors.password.message}
//                 </p>
//               )}
//             </div>

//             {errorMessage && (
//               <p role="alert" className="text-sm text-destructive">
//                 {errorMessage}
//               </p>
//             )}

//             <Button type="submit" disabled={isLoading} className="w-full">
//               {isLoading ? "Signing in..." : "Sign in"}
//             </Button>
//           </form>

//           <div className="mt-6 space-y-2 text-center text-sm">
//             <p className="text-muted-foreground">
//               Don&apos;t have an account?{" "}
//               <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
//                 Create an account
//               </Link>
//             </p>

//             <p>
//               <Link to="/forgot-password" className="text-muted-foreground underline-offset-4 hover:underline">
//                 Forgot your password?
//               </Link>
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </main>
//   );
// }

return (
  <AuthLayout title="Sign in">
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
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p role="alert" className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>

    <div className="mt-6 space-y-2 text-center text-sm">
      <p className="text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>

      <p>
        <Link to="/forgot-password" className="text-muted-foreground underline-offset-4 hover:underline">
          Forgot your password?
        </Link>
      </p>
    </div>
  </AuthLayout>
);

}