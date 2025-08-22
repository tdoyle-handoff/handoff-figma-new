// utils/supabase/info.ts
// Centralized Supabase config and identifiers

// Primary constants (preferred imports)
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Supabase project ref from the URL subdomain, e.g. https://xgzyid...supabase.co -> xgzyid...
export const projectId: string = (() => {
  try {
    const host = new URL(SUPABASE_URL).host; // e.g., xxxxx.supabase.co
    return host.split('.')[0] ?? '';
  } catch {
    return '';
  }
})();

// Back-compat exports used elsewhere
export const publicAnonKey: string = SUPABASE_ANON_KEY;
export const projectUrl: string = SUPABASE_URL;
export const anonKey: string = SUPABASE_ANON_KEY;
export const projectRef: string = projectId;

