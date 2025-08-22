#!/bin/bash

# Handoff Platform - Setup Verification Script
# This script checks if your environment is ready for deployment

set -e

echo "🔍 Handoff Platform - Setup Verification"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success") echo -e "${GREEN}✅ $message${NC}" ;;
        "error") echo -e "${RED}❌ $message${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $message${NC}" ;;
        "info") echo -e "${BLUE}ℹ️  $message${NC}" ;;
    esac
}

# Check if files exist
print_status "info" "Checking project structure..."

if [ ! -f "supabase/functions/server/index.tsx" ]; then
    print_status "error" "Server function not found at supabase/functions/server/index.tsx"
    exit 1
fi
print_status "success" "Server function found"

if [ ! -f "supabase/config.toml" ]; then
    print_status "warning" "Supabase config not found - creating from template"
    echo "Run: supabase init to create config"
else
    print_status "success" "Supabase config found"
fi

# Check if Supabase CLI is installed
print_status "info" "Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    print_status "error" "Supabase CLI is not installed"
    echo ""
    echo "Install with:"
    echo "  macOS: brew install supabase/tap/supabase"
    echo "  Windows: choco install supabase"
    echo "  Other: npm install -g supabase"
    exit 1
else
    VERSION=$(supabase --version)
    print_status "success" "Supabase CLI installed: $VERSION"
fi

# Check if user is logged in
print_status "info" "Checking Supabase authentication..."
if ! supabase auth status &> /dev/null; then
    print_status "warning" "Not logged in to Supabase"
    echo ""
    echo "Login with: supabase login"
    NEEDS_LOGIN=true
else
    print_status "success" "Logged in to Supabase"
    NEEDS_LOGIN=false
fi

# Check if project is linked
print_status "info" "Checking project linking..."
if ! supabase status &> /dev/null; then
    print_status "warning" "No Supabase project linked"
    echo ""
    echo "Link project with: supabase link --project-ref YOUR_PROJECT_REF"
    echo "Find your project ref with: supabase projects list"
    NEEDS_LINK=true
else
    PROJECT_REF=$(supabase status | grep "Project ref" | awk '{print $3}' || echo "unknown")
    print_status "success" "Project linked: $PROJECT_REF"
    NEEDS_LINK=false
fi

# Check environment variables
print_status "info" "Checking environment configuration..."

ENV_ISSUES=0

if [ -f .env ]; then
    print_status "success" ".env file found"
    source .env
else
    print_status "warning" ".env file not found"
    echo "Create one from .env.example: cp .env.example .env"
    ENV_ISSUES=$((ENV_ISSUES + 1))
fi

# Check required environment variables
check_env_var() {
    local var_name=$1
    local description=$2
    local required=${3:-false}
    
    if [ -z "${!var_name}" ]; then
        if [ "$required" = true ]; then
            print_status "error" "Required: $var_name ($description)"
            ENV_ISSUES=$((ENV_ISSUES + 1))
        else
            print_status "warning" "Optional: $var_name ($description)"
        fi
    else
        print_status "success" "$var_name is set"
    fi
}

check_env_var "SUPABASE_URL" "Main Supabase project URL" true
check_env_var "SUPABASE_ANON_KEY" "Public anonymous key" true
check_env_var "SUPABASE_SERVICE_ROLE_KEY" "Service role key" true
check_env_var "GOOGLE_PLACES_API_KEY" "Google Places API for address validation"
check_env_var "ATTOM_API_KEY" "ATTOM Data API for property information"

# Check project info file
print_status "info" "Checking project configuration..."
if grep -q "your-project-id-here" utils/supabase/info.tsx 2>/dev/null; then
    print_status "warning" "Project ID not updated in utils/supabase/info.tsx"
    echo "Update with your real project credentials after deployment"
else
    print_status "success" "Project configuration appears updated"
fi

# Summary
echo ""
echo "📋 Verification Summary"
echo "======================"

if [ "$NEEDS_LOGIN" = true ]; then
    print_status "error" "Need to login to Supabase"
    echo "   Run: supabase login"
fi

if [ "$NEEDS_LINK" = true ]; then
    print_status "error" "Need to link Supabase project"
    echo "   Run: supabase link --project-ref YOUR_PROJECT_REF"
fi

if [ $ENV_ISSUES -gt 0 ]; then
    print_status "error" "$ENV_ISSUES environment variable issues found"
    echo "   Check .env file and add missing variables"
fi

# Readiness check
READY=true
if [ "$NEEDS_LOGIN" = true ] || [ "$NEEDS_LINK" = true ] || [ $ENV_ISSUES -gt 0 ]; then
    READY=false
fi

echo ""
if [ "$READY" = true ]; then
    print_status "success" "Environment is ready for deployment!"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Run: ./deploy.sh"
    echo "   2. Test: visit ?server-check=true"
    echo "   3. Update utils/supabase/info.tsx with real credentials"
else
    print_status "error" "Environment needs setup before deployment"
    echo ""
    echo "🔧 Fix the issues above, then run this script again"
fi

echo ""
echo "📚 Documentation:"
echo "   QuickStart.md - Fast setup guide"
echo "   SupabaseDeploymentGuide.md - Detailed instructions"
echo "   AuthenticationTroubleshooting.md - Help with auth issues"

echo ""
echo "🧪 Useful URLs after deployment:"
echo "   ?server-check=true - Check deployment status"
echo "   ?login-fix=true - Fix login issues"
echo "   ?auth-diagnostic=true - Comprehensive auth testing"