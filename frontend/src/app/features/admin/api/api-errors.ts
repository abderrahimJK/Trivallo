import { HttpErrorResponse } from '@angular/common/http';

/** A field error from the backend's ProblemDetail (400 validation or rule violation). */
export interface FieldError {
  field: string;
  message: string;
}

export interface ApiFailure {
  message: string;
  fieldErrors: FieldError[];
}

/** Turns any failed admin call into a message the form can show next to its submit button. */
export function toApiFailure(error: unknown): ApiFailure {
  if (!(error instanceof HttpErrorResponse)) {
    return { message: 'Something went wrong. Please try again.', fieldErrors: [] };
  }
  const body = error.error as { detail?: string; errors?: FieldError[] } | null;
  const fieldErrors = Array.isArray(body?.errors) ? body.errors : [];
  switch (error.status) {
    case 0:
      return { message: 'The server cannot be reached. Check your connection.', fieldErrors };
    case 401:
    case 403:
      return {
        message: 'Your session has expired or lacks admin rights. Sign in again.',
        fieldErrors,
      };
    case 413:
      return { message: 'The file is too large (10 MB maximum).', fieldErrors };
    default:
      return { message: body?.detail ?? `Request failed (${error.status}).`, fieldErrors };
  }
}
