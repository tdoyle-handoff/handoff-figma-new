#!/bin/bash

# Handoff Platform - Supabase Deployment Script
# This script automates the deployment of your Edge Functions

set -e  # Exit on any error

echo "🚀 Handoff Platform - Supabase Deployment"
echo "=========================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed"
    echo "Please install it first:"
    echo "  macOS: brew install supabase/tap/supabase"
    echo "  Windows: choco install supabase"
    echo "  Other: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI is installed"

# Check if user is logged in
if ! supabase auth status &> /dev/null; then
    echo "❌ You are not logged in to Supabase"
    echo "Please run: supabase login"
    exit 1
fi

echo "✅ Logged in to Supabase"

# Check if project is linked
if ! supabase status &> /dev/null; then
    echo "❌ No Supabase project linked"
    echo "Please run: supabase link --project-ref YOUR_PROJECT_REF"
    echo "To find your project ref, run: supabase projects list"
    exit 1
fi

echo "✅ Project is linked"

# Get project info
PROJECT_REF=$(supabase status | grep "Project ref" | awk '{print $3}')
echo "📊 Project Reference: $PROJECT_REF"

# Check if required environment variables are set
echo "🔍 Checking environment variables..."

# Function to check and set secret
check_and_set_secret() {
    local key=$1
    local description=$2
    local required=${3:-false}
    
    if [ -z "${!key}" ]; then
        if [ "$required" = true ]; then
            echo "❌ Required environment variable $key is not set"
            echo "Please set it in your .env file or environment"
            exit 1
        else
            echo "⚠️  Optional environment variable $key is not set ($description)"
        fi
    else
        echo "✅ Setting $key in Supabase..."
        supabase secrets set "$key=${!key}" --quiet || {
            echo "❌ Failed to set $key"
            exit 1
        }
    fi
}

# Load .env file if it exists
if [ -f .env ]; then
    echo "📄 Loading .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check and set required secrets
check_and_set_secret "SUPABASE_URL" "Main Supabase URL" true
check_and_set_secret "SUPABASE_ANON_KEY" "Public anonymous key" true  
check_and_set_secret "SUPABASE_SERVICE_ROLE_KEY" "Service role key for admin operations" true

# Check and set optional secrets
check_and_set_secret "GOOGLE_PLACES_API_KEY" "Google Places API for address validation"
check_and_set_secret "ATTOM_API_KEY" "ATTOM Data API for property information"
check_and_set_secret "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID" "Google OAuth Client ID"
check_and_set_secret "SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET" "Google OAuth Client Secret"

echo "✅ Environment variables configured"

# Deploy Edge Functions
echo "🚀 Deploying Edge Functions..."
echo "This may take a few minutes..."

if supabase functions deploy server; then
    echo "✅ Edge Functions deployed successfully!"
else
    echo "❌ Failed to deploy Edge Functions"
    echo "Check the error messages above and try again"
    exit 1
fi

# Get the function URL
FUNCTION_URL="https://${PROJECT_REF}.supabase.co/functions/v1/make-server-a24396d5"

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "Your server is now available at:"
echo "🌐 Health Check: ${FUNCTION_URL}/health"
echo "🔐 Authentication: ${FUNCTION_URL}/user/*"
echo "🏠 Property Data: ${FUNCTION_URL}/attom/*"
echo "🗺️  Address Validation: ${FUNCTION_URL}/places/*"
echo "📋 MLS Integration: ${FUNCTION_URL}/mls/*"
echo ""

# Test the deployment
echo "🧪 Testing deployment..."
if curl -s "${FUNCTION_URL}/health" | grep -q "healthy"; then
    echo "✅ Server is responding correctly!"
else
    echo "⚠️  Server might not be fully ready yet (this is normal)"
    echo "   Try the health check URL in a few minutes"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Update your local environment with project credentials"
echo "2. Test authentication in your app"
echo "3. Verify all features are working"
echo ""
echo "📊 Monitor your functions:"
echo "   Dashboard: https://supabase.com/dashboard/project/${PROJECT_REF}"
echo "   Logs: supabase functions logs server"
echo ""
echo "🔄 To redeploy after changes:"
echo "   supabase functions deploy server"
echo ""