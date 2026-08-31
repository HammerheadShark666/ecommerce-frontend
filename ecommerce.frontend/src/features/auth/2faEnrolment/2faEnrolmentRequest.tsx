import { useCallback, useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/layouts/authLayout";

// ASSUMPTION: mirrors the shape used by setCredentials in auth.slice.
import type { RootState } from "../../../app/store";

import {
  useEnrolmentMutation,
  useVerifyMutation,
  //useLazyGetRecoveryCodesQuery,
} from "./2faEnrolment.api";

const codeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your authenticator app"),
});

type CodeForm = z.infer<typeof codeSchema>;

type Step = "loading" | "scan" | "recovery" | "enrol-failed";

export default function TwofaEnrolmentPage() {
  const navigate = useNavigate();
  const email = useSelector((state: RootState) => state.auth.email);

  const [step, setStep] = useState<Step>("loading");
  //const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [hasSavedCodes, setHasSavedCodes] = useState(false);

  const [enrolTwofa, { data: enrolment, isLoading: isEnrolling }] = useEnrolmentMutation();
  const [verifyTwofa, { isLoading: isVerifying, error: verifyError }] = useVerifyMutation();
  //const [fetchRecoveryCodes, { isFetching: isFetchingCodes, error: recoveryError }] = useLazyGetRecoveryCodesQuery();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CodeForm>({
    resolver: zodResolver(codeSchema),
  });

 

const startEnrolment = useCallback(
  async (targetEmail: string) => {
    setStep("loading");

    try {
      await enrolTwofa({ email: targetEmail }).unwrap();
      setStep("scan");
    } catch {
      setStep("enrol-failed");
    }
  },
  [enrolTwofa],
);

const hasStartedEnrolment = useRef(false);

useEffect(() => {
  if (!email) {
    navigate("/login", { replace: true });
    return;
  }

  if (hasStartedEnrolment.current) {
    return;
  }

  hasStartedEnrolment.current = true;
  void startEnrolment(email);
}, [email, navigate, startEnrolment]);


 

  const onSubmit = async (data: CodeForm) => {
    if (!email) {
      return;
    }

    try {
      await verifyTwofa({ email, code: data.code }).unwrap();

      // const codes = await fetchRecoveryCodes({ email }).unwrap();
      // setRecoveryCodes(codes.recoveryCodes);
      setStep("recovery");
    } catch {
      setError("code", {
        message: "That code was not recognised. Check the time on your device and try again.",
      });
    }
  };

  // const handleCopyCodes = () => {
  //   void navigator.clipboard.writeText(recoveryCodes.join("\n"));
  // };

  // const handleDownloadCodes = () => {
  //   const blob = new Blob([recoveryCodes.join("\n")], { type: "text/plain" });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = "recovery-codes.txt";
  //   link.click();
  //   URL.revokeObjectURL(url);
  // };

  const handleFinish = () => {
    navigate("/", { replace: true });
  };

  if (step === "loading" || isEnrolling) {
    return (
      <AuthLayout title="Set up two-factor authentication">
        <p className="text-sm text-muted-foreground">Generating your QR code…</p>
      </AuthLayout>
    );
  }

  if (step === "enrol-failed") {
    return (
      <AuthLayout title="Set up two-factor authentication">
        <p role="alert" className="text-sm text-destructive">
          We could not start 2FA enrolment. Please try again.
        </p>
        <Button className="mt-4 w-full" onClick={() => email && startEnrolment(email)}>
          Retry
        </Button>
      </AuthLayout>
    );
  }

  if (step === "recovery") {
    return (
      <AuthLayout title="Save your recovery codes">
        <p className="text-sm text-muted-foreground">
          Store these 10 codes somewhere safe. Each one can be used once to sign in if you lose
          access to your authenticator app. They will not be shown again.
        </p>

        {/* {isFetchingCodes && (
          <p className="mt-4 text-sm text-muted-foreground">Loading recovery codes…</p>
        )}

        {recoveryError && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            We could not load your recovery codes. Refresh this page to try again — do not leave
            without saving them.
          </p>
        )}

        {recoveryCodes.length > 0 && (
          <ul className="mt-4 grid grid-cols-2 gap-2 rounded-md border p-4 font-mono text-sm">
            {recoveryCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
        )} */}

        {/* <div className="mt-4 flex gap-2">
          <Button type="button" variant="outline" onClick={handleCopyCodes}>
            Copy codes
          </Button>
          <Button type="button" variant="outline" onClick={handleDownloadCodes}>
            Download .txt
          </Button>
        </div> */}

        <div className="mt-6 flex items-start gap-2">
          <input
            id="saved-confirmation"
            type="checkbox"
            checked={hasSavedCodes}
            onChange={(e) => setHasSavedCodes(e.target.checked)}
            className="mt-1"
          />
          <Label htmlFor="saved-confirmation" className="font-normal">
            I have saved my recovery codes in a safe place.
          </Label>
        </div>

        <Button className="mt-4 w-full" disabled={!hasSavedCodes} onClick={handleFinish}>
          Finish
        </Button>
      </AuthLayout>
    );
  }

  // step === "scan"
  return (
    <AuthLayout title="Set up two-factor authentication">
      <p className="text-sm text-muted-foreground">
        Scan this QR code with your authenticator app (e.g. Google Authenticator, Authy), then
        enter the 6-digit code it generates.
      </p>

      {enrolment && (
        <>
          <img
            src={`data:image/png;base64,${enrolment.qrCodeBase64}`}
            alt="QR code for two-factor authentication enrolment"
            className="mx-auto my-4 h-48 w-48"
          />

          <details className="mb-4 text-sm text-muted-foreground">
            <summary className="cursor-pointer">Can&apos;t scan the code?</summary>
            <p className="mt-2 break-all font-mono text-xs">{enrolment.qtpAuthUri}</p>
          </details>
        </>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">6-digit code</Label>
          <Input
            id="code"
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
          {verifyError && !errors.code && (
            <p role="alert" className="text-sm text-destructive">
              Verification failed. Please try again.
            </p>
          )}
        </div>

        <Button type="submit" disabled={isVerifying} className="w-full">
          {isVerifying ? "Verifying…" : "Verify and enable 2FA"}
        </Button>
      </form>
    </AuthLayout>
  );
}
