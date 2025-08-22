export const TROUBLESHOOTING_GUIDE = [
  {
    title: 'Authentication Failed (401/403)',
    color: 'red',
    items: [
      'Verify your API key is correct and complete',
      'Check if your API key has expired',
      'Ensure your account has necessary permissions',
      'Contact ATTOM Data support if needed'
    ]
  },
  {
    title: 'Network/Timeout Errors',
    color: 'yellow',
    items: [
      'Check your internet connection',
      'Verify the ATTOM API service status',
      'Try again after a few minutes',
      'Check if any firewall is blocking requests'
    ]
  },
  {
    title: 'Environment Configuration',
    color: 'blue',
    items: [
      'Ensure ATTOM_API_KEY is set in your deployment',
      'Check for any extra spaces or special characters',
      'Verify the environment variable is properly loaded',
      'Restart your server after making changes'
    ]
  }
];

export const STATUS_MESSAGES = {
  VALIDATING: 'Testing API key authentication...',
  NOT_TESTED: 'API key validation has not been performed.',
  DEFAULT: 'Validation completed.'
};

export const API_STATUS_TYPES = {
  ACTIVE_WITH_DATA: 'active_with_data',
  ACTIVE_NO_DATA: 'active_no_data',
  ACTIVE: 'active'
} as const;

export const VALIDATION_MESSAGES = {
  [API_STATUS_TYPES.ACTIVE_WITH_DATA]: 'API key is valid with successful data retrieval',
  [API_STATUS_TYPES.ACTIVE_NO_DATA]: 'API key is valid (test returned no data for sample address, which is normal)',
  [API_STATUS_TYPES.ACTIVE]: 'API key is valid and authentication successful'
};