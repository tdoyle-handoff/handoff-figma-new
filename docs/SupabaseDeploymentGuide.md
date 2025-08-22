# Supabase Deployment Guide

Comprehensive guide for setting up Supabase backend infrastructure for Handoff.

## Overview

Handoff uses Supabase for:
- **PostgreSQL Database** - Property, user, and transaction data
- **Authentication** - Google OAuth and email/password
- **Edge Functions** - API integrations and business logic
- **File Storage** - Document and image uploads
- **Real-time** - Live updates across team members

## Quick Setup

### Automated Deployment
```bash
# Run the automated setup script
./deploy.sh
```

This script will:
1. Verify Supabase CLI installation
2. Initialize your project
3. Deploy all edge functions
4. Set up database schema
5. Configure authentication

## Manual Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database provisioning (2-3 minutes)
4. Note your project URL and API keys

### 2. Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# npm (cross-platform)
npm install -g supabase
```

### 3. Initialize Local Project

```bash
# Login to Supabase
supabase login

# Initialize project
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref
```

### 4. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy server
```

### 5. Set Environment Variables

In your Supabase dashboard, go to **Settings** → **Edge Functions** and add:

```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_PLACES_API_KEY=your_google_places_key
ATTOM_API_KEY=your_attom_api_key
```

## Database Schema

### Key Value Store
The main data storage uses a flexible key-value table:

```sql
CREATE TABLE kv_store_a24396d5 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Authentication Setup
Configure OAuth providers in **Authentication** → **Providers**:

1. **Google OAuth**
   - Enable Google provider
   - Add your Google OAuth credentials
   - Set redirect URLs

2. **Email Authentication**
   - Configure SMTP settings (optional)
   - Set up password reset templates

## Edge Functions

### Function Structure
```
supabase/functions/server/
├── index.tsx          # Main Hono server
├── api-key-manager.ts # API key management
├── attom.ts          # ATTOM API integration
├── mls.ts            # MLS data integration  
├── places.ts         # Google Places API
├── user.ts           # User management
└── kv_store.tsx      # Database utilities
```

### Testing Functions Locally

```bash
# Start local development server
supabase start

# Serve functions locally
supabase functions serve

# Test with curl
curl -X POST 'http://localhost:54321/functions/v1/make-server-a24396d5/test' \
  --header 'Authorization: Bearer your-anon-key' \
  --header 'Content-Type: application/json'
```

## Security Configuration

### Row Level Security (RLS)
Enable RLS on all tables:

```sql
ALTER TABLE kv_store_a24396d5 ENABLE ROW LEVEL SECURITY;

-- Example policy for user data
CREATE POLICY "Users can access own data" ON kv_store_a24396d5
  FOR ALL USING (
    key LIKE 'user:' || auth.uid() || '%'
  );
```

### API Key Security
- Store API keys in Supabase secrets
- Never expose service role key to frontend
- Use environment variables for configuration

## Storage Setup

### File Buckets
Create storage buckets for document uploads:

```sql
-- Create private bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('make-a24396d5-documents', 'documents', false);

-- Create bucket policy
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'make-a24396d5-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Monitoring & Logging

### Function Logs
View logs in Supabase dashboard:
- **Functions** → **Logs**
- **Database** → **Logs**
- **Auth** → **Logs**

### Performance Monitoring
```typescript
// Add logging to edge functions
console.log('Function execution time:', Date.now() - startTime);
console.error('Error details:', { error, context });
```

## Troubleshooting

### Common Issues

**Function Deployment Failed**
```bash
# Check function syntax
supabase functions serve --no-verify-jwt

# Verify environment variables
supabase secrets list
```

**Database Connection Issues**
- Verify project ref in `supabase/config.toml`
- Check network connectivity
- Confirm database is not paused

**Authentication Problems**
- Verify OAuth redirect URLs
- Check provider configuration
- Test with curl commands

### Diagnostic Commands

```bash
# Check project status
supabase status

# View project details
supabase projects list

# Test database connection
supabase db ping

# Check function logs
supabase functions logs server
```

## Production Considerations

### Performance
- Enable connection pooling
- Configure appropriate timeout values
- Monitor function execution times

### Security
- Rotate API keys regularly  
- Use least-privilege access policies
- Enable audit logging

### Backups
- Configure automatic database backups
- Export critical data regularly
- Test restoration procedures

## Migration Guide

### From Development to Production
1. Export development data
2. Create production project
3. Deploy functions and schema
4. Import data and test
5. Update DNS and environment variables

### Version Updates
```bash
# Update Supabase CLI
npm update -g supabase

# Pull latest schema changes
supabase db pull

# Deploy updates
supabase functions deploy
```

---

## Next Steps

- [Configure API Integrations](ATTOM_API_Configuration_Guide.md)
- [Set up Authentication](AuthenticationTroubleshooting.md)
- [Deploy to Production](production-deployment.md)

For additional help, check the [Supabase documentation](https://supabase.com/docs) or create a GitHub issue.