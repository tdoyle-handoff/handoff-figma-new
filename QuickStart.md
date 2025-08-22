# Handoff Platform - Quick Start Guide

Get your authentication server running in under 10 minutes!

## 🚀 One-Command Setup

If you already have the Supabase CLI and a project set up:

```bash
chmod +x deploy.sh && ./deploy.sh
```

## 📋 Step-by-Step Setup

### 1. Install Supabase CLI

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```bash
choco install supabase
```

**Linux/Other:**
```bash
npm install -g supabase
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Sign in
3. Click "New Project" 
4. Name it "Handoff Platform"
5. Set a strong password
6. Wait 2-3 minutes for creation

### 3. Get Your Credentials

From your project dashboard → Settings → API:
- Copy **Project URL**
- Copy **Project Reference ID** 
- Copy **anon public key**
- Copy **service_role key**

### 4. Quick Deploy

```bash
# Login to Supabase
supabase login

# Link your project (use your reference ID)
supabase link --project-ref YOUR_PROJECT_REF

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# Set at least: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# Deploy with one command
./deploy.sh
```

### 5. Test Your Server

Visit: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-a24396d5/health`

You should see:
```json
{
  "success": true,
  "status": "healthy",
  "server": "handoff-make-server"
}
```

### 6. Update Your App

In `utils/supabase/info.tsx`, update:
```typescript
export const projectId = 'your-actual-project-id';
export const publicAnonKey = 'your-actual-anon-key';
```

## ✅ Done!

Your authentication server is now live. Try:

- **Sign up/Sign in**: Should work without "Server not available" errors
- **Test tools**: Visit `?login-fix=true` or `?auth-diagnostic=true`
- **Property features**: ATTOM API, MLS, Google Places integration

## 🔧 Common Issues

**"Command not found: supabase"**
- Install the CLI first (see step 1)

**"No project linked"**
- Run `supabase link --project-ref YOUR_REF`
- Get your ref with `supabase projects list`

**"Failed to deploy"**
- Check you're logged in: `supabase auth status`
- Verify .env file has correct values
- Try `supabase functions deploy server` manually

**Authentication still not working**
- Wait 2-3 minutes after deployment
- Check health endpoint responds
- Verify project ID in your app matches Supabase

## 🎯 Next Steps

1. **Enable Google OAuth** (optional):
   - Set up Google OAuth credentials
   - Add them to Supabase secrets
   - Enable in Supabase Auth settings

2. **Add API Keys** (optional):
   - Get Google Places API key for address validation
   - Get ATTOM API key for property data
   - Add to .env and redeploy

3. **Monitor Usage**:
   - Check Supabase dashboard for function calls
   - View logs: `supabase functions logs server`

## 📚 Full Documentation

- **Detailed Setup**: `SupabaseDeploymentGuide.md`
- **Authentication Help**: `AuthenticationTroubleshooting.md`
- **Google Places Setup**: `GooglePlacesSetup.md`

---

**Need help?** The deployment script provides detailed error messages and next steps.