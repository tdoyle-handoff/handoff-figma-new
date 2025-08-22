# Authentication Troubleshooting Guide

This document helps troubleshoot authentication issues in the Handoff real estate platform.

## Quick Access URLs

### For Server Deployment Issues
```
?server-check=true
```
**Use this if:** You're getting "Server not available" errors and need to check if your Edge Functions are deployed.

### For Existing Users Having Login Issues
```
?login-fix=true
```
**Use this if:** You're trying to sign in but getting "Invalid email or password" errors.

### For Comprehensive Authentication Diagnostics
```
?auth-diagnostic=true
```
**Use this if:** You need detailed testing of the entire authentication system.

### For Legacy Authentication Debugging
```
?diagnostic=true
```
**Use this if:** You want the original simplified diagnostic tool.

## Common Authentication Issues

### 1. "Invalid email or password" Error

**Symptoms:**
- You enter your email and password
- You get an error saying credentials are invalid
- You're certain your password is correct

**Most Likely Cause:** 
Your account doesn't exist yet in the system.

**Solution:**
1. Visit `?login-fix=true`
2. Enter your email and password
3. The tool will test sign-in and suggest creating an account if needed
4. Follow the prompts to create your account

### 2. "Server not available" Error

**Symptoms:**
- Authentication form shows server connectivity errors
- Login attempts timeout
- App suggests continuing as guest

**Most Likely Cause:** 
Supabase Edge Functions are not deployed or configured.

**Solution:**
1. Visit `?server-check=true` to check deployment status
2. If not deployed, follow the deployment instructions shown
3. Run `./deploy.sh` or follow the manual deployment steps
4. Verify Edge Functions are deployed with `?auth-diagnostic=true`

### 3. Authentication Works but Profile Not Loading

**Symptoms:**
- Login appears successful
- User gets logged in but profile data is missing
- App behaves as if user has no data

**Most Likely Cause:** 
Profile creation failed or profile data is corrupted.

**Solution:**
1. Visit `?auth-diagnostic=true`
2. Run environment tests to check stored session data
3. Clear browser local storage and try signing in again
4. Use the profile creation test with your credentials

### 4. Stuck in Loading State

**Symptoms:**
- App shows loading spinner indefinitely
- Authentication never completes
- No error messages displayed

**Most Likely Cause:** 
Network timeouts or server response issues.

**Solution:**
1. Refresh the page and try again
2. Visit `?auth-diagnostic=true` to check server connectivity
3. Clear browser cache and local storage
4. Try continuing as guest if server is unavailable

## Diagnostic Tools Overview

### 1. Server Deployment Checker (`?server-check=true`)

**Purpose:** Check if your Supabase Edge Functions are deployed and accessible.

**Features:**
- Real-time deployment status checking
- Direct health endpoint testing
- Project configuration validation
- Step-by-step deployment instructions

**When to Use:**
- You're getting "Server not available" errors
- You need to verify your deployment status
- You want to check server connectivity
- You're setting up the platform for the first time

### 2. Existing User Login Fix (`?login-fix=true`)

**Purpose:** Specifically designed to help existing users who can't sign in.

**Features:**
- Tests your specific email/password combination
- Determines if your account exists
- Offers to create account if needed
- Provides step-by-step guidance

**When to Use:**
- You're getting login errors
- You think you have an account but can't access it
- You need a simple, guided troubleshooting experience

### 3. Authentication Diagnostic (`?auth-diagnostic=true`)

**Purpose:** Comprehensive testing of the entire authentication system.

**Features:**
- Server connection testing
- Authentication flow testing
- Environment analysis
- Supabase client testing
- Detailed technical information

**When to Use:**
- You're a developer debugging authentication issues
- You need detailed technical diagnostics
- You want to test the entire authentication infrastructure
- You're setting up the system for the first time

### 4. Legacy Diagnostic (`?diagnostic=true`)

**Purpose:** Original diagnostic tool with basic functionality.

**Features:**
- Basic server connectivity tests
- Simple authentication testing
- Legacy compatibility

**When to Use:**
- You prefer the simpler interface
- You're familiar with the original tool
- You need basic connectivity testing

## Step-by-Step Troubleshooting

### For End Users (Non-Technical)

1. **Try the Login Fix Tool First**
   - Go to `?login-fix=true`
   - Enter your email and password
   - Follow the guidance provided

2. **If Tool Says "Server Not Available"**
   - This is normal for development environments
   - Use "Continue as Guest" to explore the app
   - Contact your administrator about server deployment

3. **If Tool Suggests Creating Account**
   - Enter your full name when prompted
   - Click "Create Account with This Email"
   - You'll then be able to sign in normally

### For Developers (Technical)

1. **Start with Comprehensive Diagnostics**
   - Go to `?auth-diagnostic=true`
   - Run all connection tests first
   - Check server status and environment

2. **Test Specific User Credentials**
   - Use the Authentication tab
   - Enter test credentials
   - Run both sign-in and sign-up tests

3. **Analyze Environment Issues**
   - Check the Environment tab
   - Look for stored session data
   - Verify configuration settings

4. **Review Technical Details**
   - Expand "Technical Details" in test results
   - Check console logs for additional errors
   - Verify API responses and error messages

## Understanding Error Messages

### Client-Side Errors

- **"Invalid email or password"** → Account doesn't exist, need to create one
- **"Server not available"** → Supabase Edge Functions not deployed
- **"Request timed out"** → Network issues or server overload
- **"Invalid server response"** → Server configuration problems

### Server-Side Errors

- **"Account already exists"** → Email is registered but password is wrong
- **"Too many requests"** → Rate limiting active, wait and try again
- **"Email not confirmed"** → Email verification required (if enabled)

## Prevention and Best Practices

### For Users
- Use the diagnostic tools when issues arise
- Don't assume you have an account if you get login errors
- Try account creation if sign-in fails
- Keep track of your credentials securely

### For Developers
- Regularly test authentication flows
- Monitor server deployment status
- Keep diagnostic tools updated
- Provide clear error messages to users

## Getting Additional Help

If the diagnostic tools don't resolve your issue:

1. **Check the Console Logs**
   - Open browser developer tools
   - Look for error messages in the console
   - Share these with technical support

2. **Document Your Steps**
   - What URL parameters you used
   - What error messages you saw
   - What diagnostic results showed

3. **Try Alternative Approaches**
   - Use guest mode to access the app
   - Try different browsers or devices
   - Clear all browser data and start fresh

## URL Parameter Reference

| Parameter | Purpose | When to Use |
|-----------|---------|-------------|
| `?server-check=true` | Check server deployment status | "Server not available" errors |
| `?login-fix=true` | Fix existing user login issues | Login errors, account confusion |
| `?auth-diagnostic=true` | Comprehensive auth testing | Technical debugging, setup |
| `?diagnostic=true` | Legacy diagnostic tool | Simple connectivity testing |
| `?dev=true` | Development mode | Developer features, testing |

---

**Last Updated:** [Current Date]
**Version:** 2.0
**Compatible with:** Handoff Platform v1.0+