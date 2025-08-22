import postgres from 'postgres'

// Server-side Postgres client (postgres.js)
// NOTE: Make sure DATABASE_URL is defined in your server environment.
// For hosted providers that require TLS, include `?sslmode=require` in the URL.
// Example: postgres://user:password@host:5432/dbname?sslmode=require

const connectionString = process.env.DATABASE_URL
if (!connectionString || connectionString.trim() === '') {
  throw new Error('DATABASE_URL is not set. Please configure it in your server environment.')
}

// Create a single shared client (prevents multiple connections during dev hot-reload)
const globalKey = '__handoff_sql__'
const g = globalThis as unknown as { [globalKey: string]: ReturnType<typeof postgres> | undefined }

const sql = g[globalKey] ?? postgres(connectionString)
if (!g[globalKey]) {
  g[globalKey] = sql
}

export default sql

