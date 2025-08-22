export const PROPERTY_API_CONSTANTS = {
  CACHE_KEY: 'handoff-property-basic-profile-address',
  CACHE_DURATION: 60 * 60 * 1000, // 1 hour
  API_DEBUG_PARAM: 'True'
} as const;

export const API_ERROR_MESSAGES = {
  NO_ADDRESS: 'No address provided',
  INVALID_FORMAT: 'Invalid address format',
  NO_PROPERTY_FOUND: 'No property found at the specified address. The property may not be in the ATTOM database.',
  API_UNAVAILABLE: 'Property overview will be displayed once a property address is provided in your setup.',
  FETCH_FAILED: 'Failed to fetch property data'
} as const;