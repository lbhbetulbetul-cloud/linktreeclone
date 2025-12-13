# Vercel Deployment Configuration

## Overview

This application is a **Vite + React Single Page Application (SPA)** that requires proper routing configuration on Vercel to handle client-side routing correctly.

## Problem

When deploying a SPA to Vercel, navigating directly to any route other than the root (e.g., `/auth/login`, `/dashboard`, `/:username`) results in a 404 error. This is because Vercel tries to find these paths on the server, but they only exist in the client-side React Router configuration.

## Solution

The `vercel.json` file has been added to configure Vercel to:
1. Use the correct build command and output directory
2. Rewrite all routes to `/index.html` so React Router can handle the routing

### Configuration (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Application Routes

The application supports the following routes:

- `/` - Redirects to `/dashboard`
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/dashboard` - Main dashboard (links management)
- `/dashboard/profile` - Profile editor
- `/dashboard/appearance` - Appearance customization
- `/dashboard/analytics` - Analytics
- `/dashboard/settings` - Settings
- `/:username` - Public profile page

## Deployment Steps

1. **Ensure vercel.json is committed**
   ```bash
   git add vercel.json
   git commit -m "Add vercel.json for SPA routing configuration"
   git push origin fix-vercel-spa-routing-404
   ```

2. **Deploy to Vercel**
   - Connect your repository to Vercel
   - Vercel will automatically detect the `vercel.json` configuration
   - The build will use `npm run build` and output to `dist/`
   - All routes will be rewritten to `/index.html`

3. **Verify Routes**
   After deployment, test all routes:
   - Root URL: https://your-app.vercel.app/
   - Auth routes: https://your-app.vercel.app/auth/login
   - Dashboard: https://your-app.vercel.app/dashboard
   - User profiles: https://your-app.vercel.app/testuser

## Environment Variables

Make sure to set the following environment variables in Vercel dashboard:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

Note: Environment variables for Vite must be prefixed with `VITE_` (not `NEXT_PUBLIC_`).

## Technical Details

- **Framework**: Vite 7.x
- **Build Output**: Static HTML/CSS/JS files in `dist/` directory
- **Routing**: Client-side routing with React Router v7
- **SPA**: Single HTML file (`index.html`) with JavaScript routing

## Troubleshooting

If routes still return 404 after deployment:

1. Check that `vercel.json` exists in the repository root
2. Verify the configuration matches the example above
3. Trigger a new deployment (redeploy) to ensure changes are picked up
4. Check build logs in Vercel dashboard for errors

## Alternative Configuration

If the standard rewrites don't work, you can try the alternative routes configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

However, the standard `rewrites` configuration should work for most cases.
