import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import type { BackendErrorBody, NormalizedApiError } from "@/types/api-error";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

function isBackendErrorBody(value: unknown): value is BackendErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    "statusCode" in value
  );
}

/**
 * প্রতিটি feature component-এ আলাদা try/catch + error.message parsing
 * duplicate না করে, এই একটামাত্র জায়গা থেকে RTK Query error (বা যেকোনো
 * caught error) কে একটা single, user-facing message-এ normalize করা হয়।
 * Backend-এর raw technical stack/error কখনো সরাসরি user-কে দেখানো হয় না।
 */
export function normalizeApiError(error: unknown): NormalizedApiError {
  if (isFetchBaseQueryError(error)) {
    return normalizeFetchBaseQueryError(error);
  }

  return { status: "UNKNOWN_ERROR", message: FALLBACK_MESSAGE };
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error;
}

function normalizeFetchBaseQueryError(
  error: FetchBaseQueryError,
): NormalizedApiError {
  if (error.status === "FETCH_ERROR") {
    return {
      status: "FETCH_ERROR",
      message: "Unable to reach the server. Check your connection.",
    };
  }

  if (error.status === "TIMEOUT_ERROR") {
    return { status: "TIMEOUT_ERROR", message: "The request timed out." };
  }

  if (error.status === "PARSING_ERROR") {
    return { status: "PARSING_ERROR", message: FALLBACK_MESSAGE };
  }

  if (typeof error.status === "number" && isBackendErrorBody(error.data)) {
    const body = error.data;
    const fieldMessages = Array.isArray(body.message) ? body.message : undefined;
    const message = Array.isArray(body.message)
      ? body.message[0]
      : body.message;

    return {
      status: error.status,
      message: message || FALLBACK_MESSAGE,
      fieldMessages,
    };
  }

  return {
    status: typeof error.status === "number" ? error.status : "UNKNOWN_ERROR",
    message: FALLBACK_MESSAGE,
  };
}
