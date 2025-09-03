// scripts/test-google-oauth.mjs
// Purpose: Quick check that Supabase is reachable and Google OAuth is enabled/configured.
// Usage:
//   node -r dotenv/config scripts/test-google-oauth.mjs dotenv_config_path=.env.local

import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Ensure .env.local is set.');
  process.exit(1);
}

const supabase = createClient(url, anon, {
  auth: {
    // In Node, PKCE is not required for just generating the redirect URL
  },
});

const redirectTo = process.env.TEST_REDIRECT || 'http://localhost:5173/';

try {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('ERROR:', error.message || String(error));
    // Provide some common guidance
    if (/not enabled|provider/.test(error.message || '')) {
      console.error('HINT: Enable Google provider in Supabase Auth → Providers and add your OAuth client ID/secret.');
    }
    if (/redirect|callback/.test(error.message || '')) {
      console.error('HINT: Add the redirect URL to Supabase Auth → URL Configuration → Redirect URLs:', redirectTo);
    }
    process.exit(2);
  }

  if (data?.url) {
    console.log('OK: Received Google OAuth redirect URL');
    console.log(data.url);
    process.exit(0);
  } else {
    console.error('ERROR: No redirect URL returned from signInWithOAuth');
    process.exit(3);
  }
} catch (err) {
  console.error('FATAL:', err?.message || err);
  process.exit(4);
}

