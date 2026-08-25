import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { useLoginMutation } from "./authApi";
import {
  setCredentials,
  setTwoFactorPending,
} from "./authSlice";
import type { AppDispatch } from "../../app/store";

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

  return (
    <main>
      <div>
        <h1>Sign in</h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />

            {errors.password && (
              <p role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {errorMessage && (
            <p role="alert">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p>
          Don't have an account?{" "}
          <Link to="/register">
            Create an account
          </Link>
        </p>

        <p>
          <Link to="/forgot-password">
            Forgot your password?
          </Link>
        </p>
      </div>
    </main>
  );
}


// import { useEffect } from "react";

// export default function LoginPage() {
//   useEffect(() => {
//     fetch("https://localhost:7242/cors-post-test", {
//       method: "POST",
//       credentials: "include",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ test: true }),
//     })
//       .then(async (response) => {
//         console.log("Status:", response.status);
//         console.log("Response:", await response.json());
//       })
//       .catch((error) => {
//         console.error("CORS test failed:", error);
//       });
//   }, []);

//   return (
//     <div>
//       <h1>Login</h1>
//     </div>
//   );
// }



// import { useEffect } from "react";

// export default function LoginPage() {
//   useEffect(() => {
//     fetch("https://localhost:7242/cors-test", {
//       credentials: "include",
//     })
//       .then((response) => {
//         console.log("Status:", response.status);
//         return response.json();
//       })
//       .then((data) => {
//         console.log("Response:", data);
//       })
//       .catch((error) => {
//         console.error("CORS test failed:", error);
//       });
//   }, []);

//   return <h1>Login</h1>;
//}