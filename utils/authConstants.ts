// Authentication configuration and constants
export const AUTH_CONFIG = {
  SESSION_STORAGE_KEY: 'handoff_auth_session',
  AUTH_MODE_KEY: 'handoff_auth_mode',
  GUEST_PROFILE_KEY: 'handoff_guest_profile',
  GUEST_SETUP_KEY: 'handoff_guest_setupData',
  DEMO_PROFILE_KEY: 'handoff_demo_profile',
  DEMO_SETUP_KEY: 'handoff_demo_setupData',
  OFFLINE_PROFILE_KEY: 'handoff_offline_profile',
  OFFLINE_SETUP_KEY: 'handoff_offline_setupData',
  QUESTIONNAIRE_COMPLETE_KEY: 'handoff-questionnaire-complete',
  QUESTIONNAIRE_RESPONSES_KEY: 'handoff-questionnaire-responses',
  INITIAL_SETUP_COMPLETE_KEY: 'handoff-initial-setup-complete',
  SCREENING_DATA_KEY: 'handoff-screening-data',
  INITIAL_SETUP_DATA_KEY: 'handoff-initial-setup-data',
} as const;

export const AUTH_MODES = {
  AUTHENTICATED: 'authenticated',
  GUEST: 'guest',
  DEMO: 'demo',
  OFFLINE: 'offline',
} as const;

export const AUTH_TIMEOUTS = {
  REQUEST_TIMEOUT: 15000, // 15 seconds
  SESSION_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export const AUTH_VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_NAME_LENGTH: 2,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

export const AUTH_ERROR_MESSAGES = {
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 6 characters long.',
  INVALID_NAME: 'Please enter your full name (at least 2 characters).',
  MISSING_CREDENTIALS: 'Please provide both email and name.',
  MISSING_PASSWORD: 'Please provide a password.',
  NETWORK_UNAVAILABLE: '🌐 Authentication service temporarily unavailable\n\nYou can:\n• Continue as Guest to explore the app\n• Visit ?diagnostic=true to troubleshoot connection issues\n• Try again in a few moments\n\nChoose your preferred option below:',
} as const;