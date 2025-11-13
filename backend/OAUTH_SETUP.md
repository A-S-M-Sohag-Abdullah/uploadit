# OAuth Setup Guide

This guide will help you set up social authentication (Google, Facebook, GitHub, Twitter) for UploadIt.

## Overview

UploadIt supports multiple OAuth providers:
- **Google OAuth 2.0**
- **Facebook Login**
- **GitHub OAuth**
- **Twitter OAuth**

## Prerequisites

- Node.js installed
- Backend server running
- Frontend server running
- A publicly accessible URL (for production) or ngrok/localhost (for development)

---

## 1. Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**

### Step 2: Configure OAuth Consent Screen

1. Click **OAuth consent screen** in the left sidebar
2. Select **External** user type
3. Fill in required information:
   - App name: `UploadIt`
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes: `email`, `profile`
5. Save and continue

### Step 3: Create OAuth Credentials

1. Click **Credentials** in the left sidebar
2. Click **Create Credentials > OAuth client ID**
3. Select **Web application**
4. Add authorized redirect URIs:
   - Development: `http://localhost:5000/api/oauth/google/callback`
   - Production: `https://yourdomain.com/api/oauth/google/callback`
5. Click **Create**
6. Copy **Client ID** and **Client Secret**

### Step 4: Add to .env

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

---

## 2. Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps > Create App**
3. Select **Consumer** as app type
4. Fill in app details

### Step 2: Configure Facebook Login

1. In your app dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Select **Web** platform
4. Enter your site URL: `http://localhost:3000`

### Step 3: Configure OAuth Settings

1. Go to **Facebook Login > Settings**
2. Add Valid OAuth Redirect URIs:
   - Development: `http://localhost:5000/api/oauth/facebook/callback`
   - Production: `https://yourdomain.com/api/oauth/facebook/callback`
3. Save changes

### Step 4: Get App Credentials

1. Go to **Settings > Basic**
2. Copy **App ID** and **App Secret**

### Step 5: Add to .env

```env
FACEBOOK_APP_ID=your-app-id-here
FACEBOOK_APP_SECRET=your-app-secret-here
```

---

## 3. GitHub OAuth Setup

### Step 1: Create OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps > New OAuth App**

### Step 2: Fill in Application Details

- **Application name**: `UploadIt`
- **Homepage URL**:
  - Development: `http://localhost:3000`
  - Production: `https://yourdomain.com`
- **Authorization callback URL**:
  - Development: `http://localhost:5000/api/oauth/github/callback`
  - Production: `https://yourdomain.com/api/oauth/github/callback`

### Step 3: Generate Client Secret

1. After creating the app, click **Generate a new client secret**
2. Copy **Client ID** and **Client Secret**

### Step 4: Add to .env

```env
GITHUB_CLIENT_ID=your-client-id-here
GITHUB_CLIENT_SECRET=your-client-secret-here
```

---

## 4. Twitter OAuth Setup

### Step 1: Create Twitter App

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project or select existing
3. Create a new app within the project

### Step 2: Configure App Settings

1. Navigate to your app settings
2. Click **User authentication settings > Set up**
3. Select **OAuth 1.0a** (for passport-twitter)
4. Add callback URL:
   - Development: `http://localhost:5000/api/oauth/twitter/callback`
   - Production: `https://yourdomain.com/api/oauth/twitter/callback`
5. Add website URL: `http://localhost:3000`
6. Request email permission (important!)

### Step 3: Get API Keys

1. Go to **Keys and tokens**
2. Copy **API Key** (Consumer Key) and **API Secret** (Consumer Secret)

### Step 4: Add to .env

```env
TWITTER_CONSUMER_KEY=your-consumer-key-here
TWITTER_CONSUMER_SECRET=your-consumer-secret-here
```

---

## Testing OAuth Integration

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

### 2. Start Frontend Server

```bash
cd frontend
npm run dev
```

### 3. Test Social Login

1. Navigate to `http://localhost:3000/auth/login`
2. Click on any social login button
3. You should be redirected to the provider's authorization page
4. After authorization, you'll be redirected back to your app
5. Check if you're logged in successfully

---

## Troubleshooting

### Common Issues

1. **"Redirect URI mismatch"**
   - Ensure callback URLs match exactly in provider settings and your code
   - Check for trailing slashes
   - Verify http vs https

2. **"Email not provided"**
   - Ensure you've requested email scope/permission
   - For Twitter, enable email access in app settings

3. **"Invalid client ID/secret"**
   - Double-check credentials in `.env` file
   - Ensure no extra spaces or quotes
   - Restart backend server after changing `.env`

4. **CORS errors**
   - Verify `CORS_ORIGIN` in `.env` matches frontend URL
   - Check provider settings allow your domain

### Debug Mode

Enable detailed logging by setting:
```env
NODE_ENV=development
```

Check backend console for OAuth-related logs.

---

## Production Deployment

### Before Going Live:

1. **Update Redirect URLs**: Replace `localhost` with your production domain in all OAuth provider settings

2. **Update Environment Variables**:
```env
API_URL=https://api.yourdomain.com/api
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

3. **Enable HTTPS**: All OAuth providers require HTTPS in production

4. **Verify App Review**: Some providers (Facebook, Twitter) require app review before public use

5. **Test Thoroughly**: Test each OAuth provider in production environment

---

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Rotate secrets regularly** if compromised
3. **Use environment-specific credentials** (dev vs production)
4. **Implement rate limiting** on OAuth endpoints (already included)
5. **Validate redirect URLs** to prevent open redirect vulnerabilities
6. **Store tokens securely** in httpOnly cookies (consider implementing)

---

## How It Works

### OAuth Flow:

1. User clicks social login button on frontend
2. Frontend redirects to: `http://localhost:5000/api/oauth/{provider}`
3. Backend redirects to provider's authorization page
4. User authorizes the app
5. Provider redirects back to: `http://localhost:5000/api/oauth/{provider}/callback`
6. Backend verifies authorization, creates/updates user
7. Backend redirects to frontend: `http://localhost:3000/auth/callback?token={jwt}`
8. Frontend stores token and fetches user data
9. User is logged in

---

## Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Twitter OAuth Documentation](https://developer.twitter.com/en/docs/authentication/oauth-1-0a)

---

## Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review provider-specific documentation
3. Check backend console logs for errors
4. Verify all environment variables are set correctly
