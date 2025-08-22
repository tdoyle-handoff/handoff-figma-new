/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly ATTOM_API_KEY?: string
  readonly GOOGLE_PLACES_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

