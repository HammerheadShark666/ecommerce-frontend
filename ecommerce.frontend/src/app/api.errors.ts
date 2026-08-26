// export interface ApiValidationError {
//   type?: string;
//   title?: string;
//   status: 400;
//   errors: Record<string, string[]>;
//   traceId?: string;
// }

// export interface ApiProblemError {
//   type?: string;
//   title?: string;
//   status: number;
//   detail?: string;
//   traceId?: string;
// }

export interface ApiValidationError {
  type?: string;
  title?: string;
  status: 400;
  errors: Record<string, string[]>;
  traceId?: string;
}

export interface ApiProblemDetails {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  traceId?: string;
}

export type ApiError =
  | ApiValidationError
  | ApiProblemDetails;

// export type ApiError =
//   | ApiValidationError
//   | ApiProblemError;

// export function isApiValidationError(
//   data: unknown
// ): data is ApiValidationError {
//   if (
//     typeof data !== "object" ||
//     data === null
//   ) {
//     return false;
//   }

//   return (
//     "errors" in data &&
//     typeof data.errors === "object" &&
//     data.errors !== null
//   );
// }

export function isApiValidationError(
  data: unknown
): data is ApiValidationError {
  if (
    typeof data !== "object" ||
    data === null
  ) {
    return false;
  }

  return (
    "errors" in data &&
    typeof data.errors === "object" &&
    data.errors !== null
  );
}