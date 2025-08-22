# Handoff - Real Estate Transaction Platform

Handoff is a comprehensive SAAS real estate transaction platform with property management, tasks, documents, and team management capabilities. Built with React, TypeScript, and Supabase.

## 🚀 Key Features

- **Property Management**: Complete property overview with ATTOM API integration
- **Task Management**: Organized task tracking for real estate transactions
- **Document Management**: Secure document storage and sharing
- **Team Collaboration**: Multi-user support with role-based permissions
- **MLS Integration**: Property search and listing management
- **Address Validation**: Google Places API integration for accurate addresses
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Authentication**: Secure user authentication with Supabase Auth

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **APIs**: ATTOM API, Google Places API, MLS integration
- **Hosting**: Supabase hosting with Edge Functions
- **UI Components**: Custom design system with shadcn/ui components

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- ATTOM API key (optional, for property data)
- Google Places API key (optional, for address validation)

## 🏃‍♂️ Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd handoff
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Deploy Supabase functions** (if using API integrations)
   ```bash
   npm run deploy
   ```

## 🔧 Configuration

### API Key Management

Access the API Key Manager at: `https://yourapp.com/?api-key-manager=true`

Configure:
- **ATTOM API Key**: For property data and valuations
- **Google Places API Key**: For address validation and autocomplete

### Property Field Mapping

Access the Mapping Manager at: `https://yourapp.com/?mapping-manager=true`

Map ATTOM API data fields to your property display fields for customized data presentation.

## 🐛 Debug Tools

The platform includes several debugging and configuration tools:

### 1. API Key Manager
**URL**: `?api-key-manager=true`
- Configure ATTOM and Google Places API keys
- Test API connectivity and permissions
- View API usage statistics

### 2. ATTOM API Path Reference
**URL**: `?path-reference=true`
- Browse all 150+ ATTOM API data paths
- View example responses and data structures
- Copy field paths for mapping configuration

### 3. Property Field Mapping Manager
**URL**: `?mapping-manager=true`
- Map ATTOM API response data to display fields
- Test field mappings with real addresses
- Configure data transformations

### 4. API Configuration Editor
**URL**: `?api-config-editor=true`
- Interactive ATTOM API testing tool
- Configure endpoint parameters
- Debug API requests and responses

### 5. Field Mapping Debugger ⭐ **NEW**
**URL**: `?field-mapping-debugger=true`
- **Comprehensive endpoint analysis**: Test all ATTOM API endpoints simultaneously
- **Field availability tracking**: See which endpoints contain specific data fields
- **"Not available" debugging**: Identify why fields show as unavailable despite data being present
- **Data flow visualization**: Understand how data flows from API to display
- **Mapping issue detection**: Automatically detect common mapping problems
- **Export functionality**: Export debug data for analysis

#### Using the Field Mapping Debugger

1. Navigate to `https://yourapp.com/?field-mapping-debugger=true`
2. Enter a test property address
3. Click "Test All Endpoints" to analyze all ATTOM API endpoints
4. Review the analysis:
   - **Endpoint Analysis**: See which endpoints returned data successfully
   - **Field Mapping Analysis**: Identify fields showing as "not available"
   - **Raw Data Inspection**: Examine actual API response data
5. Export results for further analysis

## 📱 Mobile Support

The application is optimized for mobile devices with:
- Touch-friendly interface
- Mobile-specific navigation
- Responsive layouts
- iOS Safari compatibility
- Progressive Web App (PWA) features

## 🔐 Authentication

Handoff supports multiple authentication methods:
- Email/password authentication
- Google OAuth integration
- Guest mode for testing
- Password reset functionality

## 📊 Data Sources

### ATTOM API Integration
- Property basic profiles
- Expanded property details
- Sale history and valuations
- Automated Valuation Models (AVM)
- Market data and comparables

### Google Places API
- Address validation
- Address autocomplete
- Geocoding services

### MLS Integration
- Property listings
- Market data
- Agent information

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Supabase Deployment
```bash
# Deploy edge functions
supabase functions deploy

# Deploy to Supabase hosting (if configured)
npm run deploy
```

## 📁 Project Structure

```
├── components/           # React components
│   ├── ui/              # UI component library
│   ├── PropertyOverview/ # Property-specific components
│   └── ...
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
├── styles/              # CSS and styling
└── supabase/           # Supabase configuration and functions
    └── functions/server/ # Edge functions
```

## 🧪 Testing

The platform includes comprehensive testing and debugging tools:

- **Authentication diagnostics**
- **API connectivity testing** 
- **Property data validation**
- **Field mapping verification**
- **Mobile compatibility testing**

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [troubleshooting guide](AuthenticationTroubleshooting.md)
2. Review the [API configuration guide](ATTOM_API_Configuration_Guide.md)
3. Use the built-in debug tools
4. Contact support

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [ATTOM API Documentation](https://api.developer.attomdata.com/)
- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Made with ❤️ for real estate professionals

---

## Deployment setup (CI, Supabase, Vercel)

### GitHub Actions CI
Already configured at .github/workflows/ci.yml to run type-check, lint, and build on pushes and PRs to main.

### Supabase Edge Functions deploy
Workflow: .github/workflows/deploy-supabase.yml

Required GitHub repo secrets (Settings > Secrets and variables > Actions):
- SUPABASE_ACCESS_TOKEN — Supabase personal access token
- SUPABASE_PROJECT_REF — Project reference from Supabase Project Settings

Run it via:
- Actions tab > Deploy Supabase Functions > Run workflow, or
- Push a tag like v0.1.0

### Vercel (frontend hosting)
Recommended: connect the GitHub repo to Vercel (vercel.com) via the GitHub integration. Vercel will auto-build and deploy on pushes to main.

If you use Vercel’s GitHub integration:
- Ensure the following Environment Variables are set in Vercel Project Settings for Production:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - (optional) ATTOM_API_KEY
  - (optional) GOOGLE_PLACES_API_KEY
- vercel.json is included to configure Vite build and SPA routing.

Note: An Actions-based Vercel workflow exists but is disabled by default (.github/workflows/deploy-vercel.yml). Use Vercel’s native GitHub integration for the best experience.

### Release tagging (to trigger Supabase deploy by tag)
We provide helper scripts:
- npm run release:tag — Bumps patch version and creates a git tag (chore(release): vX.Y.Z)
- npm run release:push — Pushes commits and tags to origin

If you prefer GitHub Desktop: run npm run release:tag locally, then push via GitHub Desktop (including tags).
