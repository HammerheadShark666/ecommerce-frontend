import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import {
  isApiValidationError,
  type ApiProblemDetails,
} from "./api.errors";

export function getApiErrorMessage(
  error: unknown
): string | null {
  if (!error) {
    return null;
  }

  if (!isFetchBaseQueryError(error)) {
    return "An unexpected error occurred.";
  }

  // No response body
  if (
    typeof error.data !== "object" ||
    error.data === null
  ) {
    return getStatusMessage(error.status);
  }

  const data = error.data as ApiProblemDetails;

  // 400 validation errors
  if (isApiValidationError(data)) {
    return Object.values(data.errors)
      .flat()
      .join(" ");
  }

  // 429 Too Many Requests
  if (error.status === 429) {
    return (
      data.detail ??
      "Too many requests. Please try again later."
    );
  }

  // Other ProblemDetails errors
  if (data.detail) {
    return data.detail;
  }

  if (data.title) {
    return data.title;
  }

  return getStatusMessage(error.status);
}

function getStatusMessage(
  status: FetchBaseQueryError["status"]
): string {
  if (typeof status !== "number") {
    return "Unable to connect to the server.";
  }

  switch (status) {
    case 400:
      return "The request was invalid.";

    case 401:
      return "You are not authorized.";

    case 403:
      return "You do not have permission to perform this action.";

    case 404:
      return "The requested resource was not found.";

    case 429:
      return "Too many requests. Please try again later.";

    case 500:
      return "An unexpected server error occurred.";

    default:
      return `Request failed (${status}).`;
  }
}

function isFetchBaseQueryError(
  error: unknown
): error is FetchBaseQueryError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error
  );
}