# Google OAuth Setup Guide

## Current Issue
The app is getting "Access blocked" because the Google Cloud project hasn't completed verification. This is normal for new OAuth apps.

## Solution Options

### Option 1: Add Test Users (Recommended for Development)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" → "OAuth consent screen"
3. Under "Test users", click "ADD USERS"
4. Add your email address (`oxslimbu@gmail.com`)
5. Save the changes

This will allow you to test the app with your email address without full verification.

### Option 2: Complete App Verification (For Production)
This requires submitting your app for Google's review process, which takes several days.

## Current OAuth Configuration
- Client ID: Set in environment variables
- Client Secret: Set in environment variables  
- Redirect URI: Should be `https://your-replit-url.replit.app/auth/callback`

## Next Steps
1. Add yourself as a test user in Google Cloud Console
2. Try the OAuth flow again
3. The app should work for your email address

## Alternative: Use Demo Mode
The app includes demo files that work without Google Drive connection for testing the interface.