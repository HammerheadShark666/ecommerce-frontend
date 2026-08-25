import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
//import { useDispatch, useSelector } from "react-redux";

import { usePasswordResetRequestMutation } from "./password-reset-request.api";
// import {
//   setMessage,
// } from "./password-reset-request.slice";

//import type { AppDispatch, RootState } from "../../../../app/store";
//import { data } from "react-router-dom";

const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),
});

type PasswordResetRequestForm = z.infer<typeof passwordResetRequestSchema>;

export default function PasswordResetRequestPage() {  
  //const dispatch = useDispatch<AppDispatch>();

  const [message, setMessage] = useState<string | null>(null);

  const [passwordResetRequest, { data, isLoading, error }] = usePasswordResetRequestMutation();

  const {
    register, 
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequestForm>({
    resolver: zodResolver(passwordResetRequestSchema),
  });

  // const message = useSelector(
  //   (state: RootState) => state.passwordResetRequest.message
  // );

  useEffect(() => {
    // Optional: clear sensitive form data when leaving the page.
    return () => {};
  }, []);

  const onSubmit = async (data: PasswordResetRequestForm) => {
    try {
      const result = await passwordResetRequest(data).unwrap();

      setMessage(result.message);

      // dispatch(
      //     setMessage({
      //       message: result.message,
      //     })
      //   );
      // {       
        return;
      //}
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
    <main>
      <div>
        <h1>Request Password Reset</h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          
          {data?.message ? (
              <p>{data.message}</p>
            ) : (
              <>
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

                  {message && (
                    <p role="note">
                      {message}
                    </p>
                  )}

                  {errors.email && (
                    <p role="alert">
                      {errors.email.message}
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
                  {isLoading ? "Sending request..." : "Send Request"}
                </button>
              </>
          )}



    {/* <div>

            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
            />

             {message && (
              <p role="note">
                {message}
              </p>
            )}


            {errors.email && (
              <p role="alert">
                {errors.email.message}
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
          </button> */}
        </form>       
      </div>
    </main>
  );
}
