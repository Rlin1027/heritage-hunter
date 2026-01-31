/**
 * Validation schemas using Zod
 * Provides runtime type checking and input sanitization for API requests and responses
 */

import { z } from 'zod';

/**
 * Valid Taiwan cities (based on available data sources)
 * This list should match the cities available in the database
 */
export const VALID_CITIES = [
  '台北市',
  '新北市',
  '彰化縣',
  '嘉義市',
] as const;

/**
 * Search parameters schema for API queries
 * Validates and sanitizes user input for land searches
 */
export const searchParamsSchema = z.object({
  // Search query string (e.g., owner name, land number)
  name: z
    .string()
    .trim()
    .max(100, 'Search query must be 100 characters or less')
    .optional()
    .transform(val => val || undefined),

  // Filter by city
  city: z
    .enum(VALID_CITIES)
    .optional(),

  // Filter by district within a city
  district: z
    .string()
    .trim()
    .max(50, 'District name must be 50 characters or less')
    .optional()
    .transform(val => val || undefined),

  // Pagination: page number (1-indexed)
  page: z
    .number()
    .int()
    .min(1, 'Page must be at least 1')
    .default(1)
    .or(z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1)))
    .catch(1),

  // Pagination: items per page
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20)
    .or(z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)))
    .catch(20),
});

/**
 * Alternative search params schema using query instead of name
 * (for compatibility with existing API)
 */
export const searchParamsSchemaCompat = z.object({
  query: z
    .string()
    .trim()
    .max(100, 'Search query must be 100 characters or less')
    .optional()
    .transform(val => val || undefined),

  city: z
    .enum(VALID_CITIES)
    .optional(),

  district: z
    .string()
    .trim()
    .max(50, 'District name must be 50 characters or less')
    .optional()
    .transform(val => val || undefined),

  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .or(z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)))
    .catch(50),

  offset: z
    .number()
    .int()
    .min(0)
    .default(0)
    .or(z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(0)))
    .catch(0),
});

/**
 * Coordinates schema
 */
const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
}).nullable().optional();

/**
 * Land data schema (database format with snake_case)
 * Represents the raw data structure from the database
 */
export const landSchema = z.object({
  id: z.string().uuid(),

  // Owner/deceased name
  deceased_name: z.string().optional().nullable(),
  owner_name: z.string().optional().nullable(),

  // Location information
  source_city: z.string(),
  district: z.string(),
  section: z.string().optional().nullable(),
  land_number: z.string(),

  // Land classification and size
  land_type: z.string().optional().nullable().default('未分類'),
  area_sqm: z.number().optional().nullable(),
  area_m2: z.number().optional().nullable(),
  area_ping: z.number().optional().nullable(),

  // Rights information
  rights_type: z.string().optional().nullable().default('所有權'),
  rights_numerator: z.number().int().optional().nullable().default(1),
  rights_denominator: z.number().int().optional().nullable().default(1),

  // Status and metadata
  status: z.string().default('active'),
  announced_date: z.string().datetime().or(z.string().date()).optional().nullable(),
  data_source: z.string().optional().nullable(),
  source_url: z.string().url().optional().nullable(),

  // Geolocation
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  coordinates: coordinatesSchema,

  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),

  // Raw data
  raw_data: z.any().optional().nullable(),
});

/**
 * Frontend-compatible land schema (camelCase)
 */
export const landSchemaCompat = z.object({
  id: z.string(),
  sourceCity: z.string(),
  district: z.string(),
  section: z.string(),
  landNumber: z.string(),
  ownerName: z.string(),
  areaM2: z.number(),
  areaPing: z.number(),
  status: z.string(),
  coordinates: coordinatesSchema,
});

/**
 * Pagination metadata schema
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

/**
 * Alternative pagination schema (offset-based)
 */
export const paginationSchemaCompat = z.object({
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
  hasMore: z.boolean(),
});

/**
 * API Response schema
 */
export const apiResponseSchema = z.object({
  data: z.array(landSchema),
  pagination: paginationSchema,
});

/**
 * Compatible API Response schema
 */
export const apiResponseSchemaCompat = z.object({
  success: z.boolean(),
  data: z.array(landSchemaCompat).optional(),
  pagination: paginationSchemaCompat.optional(),
  error: z.string().optional(),
  details: z.string().optional(),
});

/**
 * Sanitize string input to prevent XSS attacks
 * Removes potentially dangerous HTML/script content
 *
 * @param input - The string to sanitize
 * @returns Sanitized string safe for display
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: protocol
    .replace(/data:/gi, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Limit length for safety
    .slice(0, 1000);
}

/**
 * Sanitize an object's string values
 * Recursively sanitizes all string values in an object
 *
 * @param obj - The object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    const value = sanitized[key];

    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value) as T[Extract<keyof T, string>];
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>) as T[Extract<keyof T, string>];
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeInput(item) :
        item && typeof item === 'object' ? sanitizeObject(item as Record<string, unknown>) :
        item
      ) as T[Extract<keyof T, string>];
    }
  }

  return sanitized;
}

// Export types inferred from schemas
export type SearchParams = z.infer<typeof searchParamsSchema>;
export type SearchParamsCompat = z.infer<typeof searchParamsSchemaCompat>;
export type Land = z.infer<typeof landSchema>;
export type LandCompat = z.infer<typeof landSchemaCompat>;
export type Pagination = z.infer<typeof paginationSchema>;
export type PaginationCompat = z.infer<typeof paginationSchemaCompat>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type ApiResponseCompat = z.infer<typeof apiResponseSchemaCompat>;
