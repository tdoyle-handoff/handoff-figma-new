#!/usr/bin/env node
/*
  Simple pre-build environment check.
  Fails the build if required variables are missing.
*/

const required = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
];

const optional = [
  "ATTOM_API_KEY",
  "GOOGLE_PLACES_API_KEY",
];

let missing = [];

for (const key of required) {
  if (!process.env[key] || String(process.env[key]).trim() === "") {
    missing.push(key);
  }
}

if (missing.length) {
  console.error("\n[ENV CHECK] Missing required environment variables:\n  - " + missing.join("\n  - "));
  console.error("\nSet these in your hosting provider environment (e.g., Vercel Project Settings → Environment Variables) and re-run the build.\n");
  process.exit(1);
}

const warnings = [];
for (const key of optional) {
  if (!process.env[key] || String(process.env[key]).trim() === "") {
    warnings.push(key);
  }
}

if (warnings.length) {
  console.warn("\n[ENV CHECK] Optional environment variables are not set:");
  for (const key of warnings) console.warn("  - " + key);
  console.warn("These features may be limited until you add them.\n");
}

console.log("[ENV CHECK] All required environment variables are present.\n");

