/**
 * Case conversion utilities for transforming between camelCase and snake_case
 * Handles nested objects, arrays, and preserves types
 */

/**
 * Converts a camelCase string to snake_case
 * @example camelToSnake("helloWorld") // "hello_world"
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Converts a snake_case string to camelCase
 * @example snakeToCamel("hello_world") // "helloWorld"
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Type helper to convert object keys from camelCase to snake_case
 */
type CamelToSnakeKeys<T> = {
  [K in keyof T as K extends string ? ReturnType<typeof camelToSnake> extends infer R ? R extends string ? R : K : K : K]: T[K] extends object
    ? T[K] extends Array<infer U>
      ? U extends object
        ? Array<CamelToSnakeKeys<U>>
        : T[K]
      : CamelToSnakeKeys<T[K]>
    : T[K];
};

/**
 * Type helper to convert object keys from snake_case to camelCase
 */
type SnakeToCamelKeys<T> = {
  [K in keyof T as K extends string ? ReturnType<typeof snakeToCamel> extends infer R ? R extends string ? R : K : K : K]: T[K] extends object
    ? T[K] extends Array<infer U>
      ? U extends object
        ? Array<SnakeToCamelKeys<U>>
        : T[K]
      : SnakeToCamelKeys<T[K]>
    : T[K];
};

/**
 * Recursively converts all object keys from camelCase to snake_case
 * Handles nested objects, arrays, null, and undefined values
 * @param obj - The object to convert
 * @returns New object with snake_case keys
 */
export function convertKeysToSnake<T>(obj: T): CamelToSnakeKeys<T> {
  if (obj === null || obj === undefined) {
    return obj as CamelToSnakeKeys<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToSnake(item)) as CamelToSnakeKeys<T>;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = camelToSnake(key);
      converted[snakeKey] = convertKeysToSnake(value);
    }

    return converted as CamelToSnakeKeys<T>;
  }

  return obj as CamelToSnakeKeys<T>;
}

/**
 * Recursively converts all object keys from snake_case to camelCase
 * Handles nested objects, arrays, null, and undefined values
 * @param obj - The object to convert
 * @returns New object with camelCase keys
 */
export function convertKeysToCamel<T>(obj: T): SnakeToCamelKeys<T> {
  if (obj === null || obj === undefined) {
    return obj as SnakeToCamelKeys<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToCamel(item)) as SnakeToCamelKeys<T>;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamel(key);
      converted[camelKey] = convertKeysToCamel(value);
    }

    return converted as SnakeToCamelKeys<T>;
  }

  return obj as SnakeToCamelKeys<T>;
}
