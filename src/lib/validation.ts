/**
 * Validation and Formatting Utilities for WiFiFly Setup
 * NZ-specific validation rules and professional formatting
 */

// ============================================================================
// NZ ISP Database with Autocomplete Support
// ============================================================================

export const NZ_ISPS = [
  'Spark',
  'Vodafone',
  '2degrees',
  'Orcon',
  'Slingshot',
  'Bigpipe',
  'Vocus',
  'MyRepublic',
  'Netway',
  'Kordia',
  'CallPlus',
  'Yoyo',
  'Snap',
  'Ihug',
  'Just Telecom',
  'Noosh',
  'TeslaNZ',
  'Unison',
  'Ultrafast Fibre (UFB)',
] as const;

export type NzIsp = (typeof NZ_ISPS)[number];

// ============================================================================
// ISP Validation and Autocomplete
// ============================================================================

export const validateIsp = (value: string): { valid: boolean; error?: string } => {
  if (!value || !value.trim()) {
    return { valid: false, error: 'Who is your provider please' };
  }

  const trimmed = value.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'ISP name must be at least 2 characters' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'ISP name must be less than 50 characters' };
  }

  // Check for invalid characters (alphanumeric, spaces, hyphens, parentheses only)
  if (!/^[a-zA-Z0-9\s\-().]*$/.test(trimmed)) {
    return { valid: false, error: 'ISP name contains invalid characters' };
  }

  return { valid: true };
};

export const getSuggestedIsps = (input: string): NzIsp[] => {
  if (!input || input.length < 1) return [];

  const normalized = input.toLowerCase().trim();
  return NZ_ISPS.filter((isp) =>
    isp.toLowerCase().includes(normalized)
  ) as NzIsp[];
};

export const normalizeIsp = (value: string): string => {
  // Trim and capitalize first letter of each word
  return value
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// ============================================================================
// Download Speed Validation (NZ-specific)
// ============================================================================

// NZ typical speeds (from 10 Mbps rural to 1000 Mbps UFB premium)
const NZ_SPEED_RANGES = {
  MIN: 1, // 1 Mbps minimum
  MAX: 1000, // 1000 Mbps maximum (UFB)
  TYPICAL_MIN: 10, // Typical rural minimum
  TYPICAL_MAX: 300, // Typical urban maximum
};

export const validateDownloadSpeed = (
  value: number | null
): { valid: boolean; error?: string; warning?: string } => {
  if (value === null || value === undefined) {
    return { valid: false, error: 'Add your ISP\'s advertised download speed' };
  }

  if (!Number.isFinite(value) || isNaN(value)) {
    return { valid: false, error: 'Please enter a valid number' };
  }

  if (value < NZ_SPEED_RANGES.MIN) {
    return {
      valid: false,
      error: `Speed must be at least ${NZ_SPEED_RANGES.MIN} Mbps`,
    };
  }

  if (value > NZ_SPEED_RANGES.MAX) {
    return {
      valid: false,
      error: `Speed cannot exceed ${NZ_SPEED_RANGES.MAX} Mbps (max NZ UFB)`,
    };
  }

  // Warning for unusual values
  if (value < NZ_SPEED_RANGES.TYPICAL_MIN) {
    return {
      valid: true,
      warning: `Speed below typical NZ minimum (${NZ_SPEED_RANGES.TYPICAL_MIN} Mbps). Rural area?`,
    };
  }

  if (value > NZ_SPEED_RANGES.TYPICAL_MAX) {
    return {
      valid: true,
      warning: `Speed above typical NZ maximum (${NZ_SPEED_RANGES.TYPICAL_MAX} Mbps). Ultra-fast Fibre?`,
    };
  }

  return { valid: true };
};

// Format speed with unit
export const formatSpeed = (mbps: number | null): string => {
  if (mbps === null || mbps === undefined) return '';
  return `${Math.round(mbps)} Mbps`;
};

// ============================================================================
// Cost Validation (NZ-specific with GST)
// ============================================================================

// NZ typical monthly internet costs (GST included)
const NZ_COST_RANGES = {
  MIN: 0, // Free plans exist (limited)
  MAX: 500, // Max realistic monthly cost
  TYPICAL_MIN: 30, // Typical budget plan (GST inc)
  TYPICAL_MAX: 150, // Typical premium plan (GST inc)
};

export const validateCost = (
  value: number | null
): { valid: boolean; error?: string; warning?: string } => {
  if (value === null || value === undefined) {
    return { valid: false, error: 'Add the monthly cost please (including GST)' };
  }

  if (!Number.isFinite(value) || isNaN(value)) {
    return { valid: false, error: 'Please enter a valid amount' };
  }

  if (value < NZ_COST_RANGES.MIN) {
    return { valid: false, error: 'Cost cannot be negative' };
  }

  if (value > NZ_COST_RANGES.MAX) {
    return {
      valid: false,
      error: `Cost cannot exceed NZ$${NZ_COST_RANGES.MAX}/month`,
    };
  }

  // Warning for unusual values
  if (value < NZ_COST_RANGES.TYPICAL_MIN && value > 0) {
    return {
      valid: true,
      warning: `Cost below typical NZ plan (NZ$${NZ_COST_RANGES.TYPICAL_MIN}). Corporate rate?`,
    };
  }

  if (value > NZ_COST_RANGES.TYPICAL_MAX) {
    return {
      valid: true,
      warning: `Cost above typical NZ plan (NZ$${NZ_COST_RANGES.TYPICAL_MAX}). Premium plan?`,
    };
  }

  return { valid: true };
};

// Format cost as NZ currency (GST inclusive notation)
export const formatCost = (nzd: number | null): string => {
  if (nzd === null || nzd === undefined) return '';
  return `NZ$${nzd.toFixed(2)} (incl. GST)`;
};

// Format cost without GST notation (for input display)
export const formatCostSimple = (nzd: number | null): string => {
  if (nzd === null || nzd === undefined) return '';
  return `NZ$${nzd.toFixed(2)}`;
};

// ============================================================================
// Room Name Validation
// ============================================================================

export const ROOM_SUGGESTIONS = [
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Study',
  'Home Office',
  'Lounge',
  'Master Bedroom',
  'Guest Bedroom',
  'Bathroom',
  'Hallway',
  'Garage',
  'Patio',
  'Garden',
  'Basement',
  'Attic',
  'Deck',
  'Balcony',
] as const;

export type RoomSuggestion = (typeof ROOM_SUGGESTIONS)[number];

export const validateRoom = (
  value: string
): { valid: boolean; error?: string } => {
  if (!value || !value.trim()) {
    return { valid: false, error: 'Room name is required' };
  }

  const trimmed = value.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'Room name must be at least 2 characters' };
  }

  if (trimmed.length > 30) {
    return { valid: false, error: 'Room name must be less than 30 characters' };
  }

  // Check for invalid characters (alphanumeric, spaces, hyphens only)
  if (!/^[a-zA-Z0-9\s\-]*$/.test(trimmed)) {
    return { valid: false, error: 'Room name contains invalid characters' };
  }

  return { valid: true };
};

export const getSuggestedRooms = (input: string): RoomSuggestion[] => {
  if (!input || input.length < 1) return [];

  const normalized = input.toLowerCase().trim();
  return ROOM_SUGGESTIONS.filter((room) =>
    room.toLowerCase().includes(normalized)
  ) as RoomSuggestion[];
};

export const normalizeRoom = (value: string): string => {
  // Trim and capitalize first letter of each word
  return value
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// ============================================================================
// Multi-field Validation for Setup Steps
// ============================================================================

export const validateSetupStep = (
  step: number,
  value: string | number | null
): { valid: boolean; error?: string; warning?: string } => {
  switch (step) {
    case 1:
      return validateIsp(String(value));
    case 2:
      return validateDownloadSpeed(value as number | null);
    case 3:
      return validateCost(value as number | null);
    case 4:
    case 5:
      return validateRoom(String(value));
    default:
      return { valid: false, error: 'Invalid step' };
  }
};

// ============================================================================
// Utility: Check if all setup is valid
// ============================================================================

export const isSetupValid = (
  isp: string,
  downloadSpeed: number | null,
  cost: number | null,
  modemRoom: string,
  additionalRooms: string[]
): boolean => {
  return (
    validateIsp(isp).valid &&
    validateDownloadSpeed(downloadSpeed).valid &&
    validateCost(cost).valid &&
    validateRoom(modemRoom).valid &&
    additionalRooms.length > 0 &&
    additionalRooms.every((room) => validateRoom(room).valid)
  );
};

// ============================================================================
// Zod Schemas for API Validation (Backend)
// ============================================================================

import { z } from 'zod';

export const sessionSchema = z.object({});

export const setupSchema = z.object({
  sessionId: z.string().uuid(),
  isp: z.string().min(1).max(100).trim(),
  planDownloadMbps: z.number().positive(),
  monthlyCostNzd: z.number().nonnegative(),
});

export const speedTestSchema = z.object({
  sessionId: z.string().uuid(),
  roomName: z.string().min(1).max(50).trim(),
  downloadMbps: z.number().nonnegative(),
  uploadMbps: z.number().nonnegative(),
  pingMs: z.number().nonnegative(),
  jitterMs: z.number().nonnegative(),
  timestamp: z.number().int().optional(),
});
