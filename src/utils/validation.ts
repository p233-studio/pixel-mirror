/**
 * Validation utilities for pixel-mirror
 *
 * Provides validation functions for user input and configuration data.
 */

import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "~/constants";
import { FileError, ValidationError } from "./errors";

// CSS length pattern: number followed by unit
const CSS_LENGTH_PATTERN = /^\d+(\.\d+)?(px|%|em|rem|vw|vh)$/;

// Color patterns
const HEX_COLOR_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
const RGB_COLOR_PATTERN = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/;

/**
 * Validation result type
 */
export type ValidationResult<T> = { success: true; data: T } | { success: false; error: ValidationError };

/**
 * Create a successful validation result
 */
export function ok<T>(data: T): ValidationResult<T> {
  return { success: true, data };
}

/**
 * Create a failed validation result
 */
export function fail<T>(message: string, details?: string): ValidationResult<T> {
  return { success: false, error: new ValidationError(message, details) };
}

/**
 * Validate CSS length value (e.g., "100px", "50%", "1.5rem")
 */
export function validateCSSLength(value: string, fieldName: string): ValidationResult<string> {
  const trimmed = value.trim();
  if (!trimmed) {
    return fail(`${fieldName} is required`);
  }
  if (!CSS_LENGTH_PATTERN.test(trimmed)) {
    return fail(`Invalid ${fieldName} format`, `Expected format like "100px", "50%", or "1.5rem", got "${value}"`);
  }
  return ok(trimmed);
}

/**
 * Validate color value (hex, rgb, or rgba)
 */
export function validateColor(value: string, fieldName: string): ValidationResult<string> {
  const trimmed = value.trim();
  if (!trimmed) {
    return fail(`${fieldName} is required`);
  }
  if (!HEX_COLOR_PATTERN.test(trimmed) && !RGB_COLOR_PATTERN.test(trimmed)) {
    return fail(`Invalid ${fieldName} format`, `Expected hex (#fff, #ffffff) or rgb/rgba format, got "${value}"`);
  }
  return ok(trimmed);
}

/**
 * Validate positive integer within range
 */
export function validatePositiveInt(
  value: number,
  fieldName: string,
  min = 1,
  max = Number.MAX_SAFE_INTEGER
): ValidationResult<number> {
  if (!Number.isInteger(value)) {
    return fail(`${fieldName} must be an integer`, `Got ${value}`);
  }
  if (value < min || value > max) {
    return fail(`${fieldName} must be between ${min} and ${max}`, `Got ${value}`);
  }
  return ok(value);
}

/**
 * Validate number within range
 */
export function validateNumberRange(
  value: number,
  fieldName: string,
  min: number,
  max: number
): ValidationResult<number> {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fail(`${fieldName} must be a number`, `Got ${value}`);
  }
  if (value < min || value > max) {
    return fail(`${fieldName} must be between ${min} and ${max}`, `Got ${value}`);
  }
  return ok(value);
}

/**
 * Validate layout grid configuration
 */
export function validateLayoutGridConfig(config: GridInput): ValidationResult<GridInput> {
  const widthResult = validateCSSLength(config.width, "Width");
  if (!widthResult.success) return widthResult as ValidationResult<GridInput>;

  const columnsResult = validatePositiveInt(config.columns, "Columns", 1, 100);
  if (!columnsResult.success) return columnsResult as ValidationResult<GridInput>;

  const gutterResult = validateCSSLength(config.gutterWidth, "Gutter width");
  if (!gutterResult.success) return gutterResult as ValidationResult<GridInput>;

  const validPositions: LayoutGridPosition[] = ["left", "center", "right"];
  if (!validPositions.includes(config.position)) {
    return fail("Invalid position", `Expected one of: ${validPositions.join(", ")}`);
  }

  return ok({
    ...config,
    width: widthResult.data,
    columns: columnsResult.data,
    gutterWidth: gutterResult.data
  });
}

/**
 * Validate file for upload
 */
export function validateFile(file: File): ValidationResult<File> {
  if (!file) {
    return fail("No file provided");
  }

  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return fail("Unsupported file type", `Allowed types: ${ALLOWED_MIME_TYPES.map((t) => t.split("/")[1]).join(", ")}`);
  }

  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return fail("File too large", `Maximum size is ${maxSizeMB}MB, got ${fileSizeMB}MB`);
  }

  return ok(file);
}

/**
 * Validate multiple files for upload
 * Returns validated files and any errors
 */
export function validateFiles(files: File[]): {
  validFiles: File[];
  errors: FileError[];
} {
  const validFiles: File[] = [];
  const errors: FileError[] = [];

  for (const file of files) {
    const result = validateFile(file);
    if (result.success) {
      validFiles.push(result.data);
    } else {
      errors.push(new FileError(`${file.name}: ${result.error.message}`, result.error.details));
    }
  }

  return { validFiles, errors };
}
