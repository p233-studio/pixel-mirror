/**
 * Error handling utilities for pixel-mirror
 */

export interface AppError {
  message: string;
  details?: string;
}

// Simple error class for validation/file errors
export class ValidationError extends Error {
  readonly details?: string;
  constructor(message: string, details?: string) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

// Alias for backwards compatibility
export const FileError = ValidationError;
export type FileError = ValidationError;

// Database errors wrap the original error
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

/**
 * Normalize any error to an AppError structure
 */
export function normalizeError(error: unknown, context?: string): AppError {
  const prefix = context ? `${context}: ` : "";

  if (error instanceof ValidationError) {
    return {
      message: prefix + error.message,
      details: error.details
    };
  }

  if (error instanceof Error) {
    return {
      message: prefix + error.message
    };
  }

  return {
    message: prefix + "An unknown error occurred"
  };
}
