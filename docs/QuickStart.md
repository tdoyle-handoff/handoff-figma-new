# Quick Start Guide

Get Handoff up and running in 5 minutes with this streamlined setup guide.

## Prerequisites

- **Node.js 18+** and npm
- **Supabase account** (free tier available)
- **Git** for version control

## 1. Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/handoff.git
cd handoff

# Install dependencies
npm install
```

## 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Required - Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional - API Keys (can be added later)
GOOGLE_PLACES_API_KEY=your_google_places_key
ATTOM_API_KEY=your_attom_api_key
```

## 3. Supabase Setup

### Option A: Quick Setup (Recommended)
```bash
# Run automated deployment script
./deploy.sh
```

### Option B: Manual Setup
1. Create a new Supabase project
2. Copy the project URL and keys to your `.env.local`
3. Deploy the edge functions manually

## 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application!

## 5. Verify Installation

```bash
# Run setup verification
./verify-setup.sh
```

## Next Steps

### Add API Keys (Optional)
1. Visit `/?api-key-manager=true` in your app
2. Add your Google Places and ATTOM API keys
3. Test the integrations using the built-in testing tools

### Explore Features
- **Property Management** - Add your first property
- **Task Tracking** - Create transaction milestones  
- **Team Management** - Invite team members
- **Document Upload** - Organize transaction documents

### Access Development Tools
- **Dev Tools**: `/?dev-tools=true`
- **Field Mapping**: `/?property-field-mapping=true`
- **API Testing**: `/?api-key-manager=true`

## Troubleshooting

### Common Issues

**Supabase Connection Failed**
- Verify your Supabase URL and keys
- Check that your project is active
- Run `./verify-setup.sh` for diagnostics

**API Keys Not Working** 
- Use the API Key Manager at `/?api-key-manager=true`
- Check key permissions and quotas
- Verify API endpoints are accessible

**Build Errors**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Getting Help
- Check the [full documentation](README.md)
- Use built-in diagnostic tools
- Create a GitHub issue with details

## Production Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with one click

### Other Platforms
- See [Production Deployment Guide](production-deployment.md)

---

**You're ready to go!** 🎉

For detailed configuration and advanced features, see the [complete documentation](README.md).