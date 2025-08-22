export const DEPLOYMENT_MESSAGES = {
  CHECKING: 'Testing server connection...',
  SUCCESS: '✅ Server is deployed and responding correctly!',
  TIMEOUT: '🕐 Server request timed out - likely not deployed yet',
  NOT_AVAILABLE: '🌐 Server not available - Edge Functions need to be deployed',
  ERROR_PREFIX: '❌ Connection error: ',
  UNKNOWN_ERROR: '❌ Unknown error occurred'
} as const;

export const DEPLOYMENT_CONFIG = {
  TIMEOUT_MS: 10000,
  HEALTH_ENDPOINT_SUFFIX: '/health'
} as const;

export const DEPLOYMENT_STEPS = [
  {
    step: 1,
    command: 'brew install supabase/tap/supabase',
    description: 'Install Supabase CLI'
  },
  {
    step: 2, 
    command: 'supabase login',
    description: 'Login'
  },
  {
    step: 3,
    command: 'supabase link --project-ref',
    description: 'Link project'
  },
  {
    step: 4,
    command: './deploy.sh',
    description: 'Deploy'
  }
] as const;