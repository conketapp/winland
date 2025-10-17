export type ConfigType = 'number' | 'string' | 'boolean' | 'json';

export type ConfigCategory = 'hold' | 'commission' | 'notification' | 'general';

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  type: ConfigType;
  label: string;
  category: ConfigCategory;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateSystemConfigDto {
  value: string;
}

// Typed config keys
export const CONFIG_KEYS = {
  HOLD_DURATION_HOURS: 'hold_duration_hours',
  HOLD_MAX_EXTENDS: 'hold_max_extends',
  HOLD_EXTEND_BEFORE_HOURS: 'hold_extend_before_hours',
  DEFAULT_COMMISSION_RATE: 'default_commission_rate',
} as const;

// Helper to get typed config value
export interface HoldConfig {
  durationHours: number;
  maxExtends: number;
  extendBeforeHours: number;
}

