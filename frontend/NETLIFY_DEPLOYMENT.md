# Netlify Deployment Guide for Sema AI Frontend

## Prerequisites

- A Netlify account
- Git repository with your Sema AI frontend code

## Configuration Files

The following configuration files have been added to your project:

1. `netlify.toml` - Contains build settings and redirect rules
2. `public/_redirects` - Ensures proper routing for the Single Page Application

## Deployment Steps

### Option 1: Deploy via Netlify UI

1. Log in to your Netlify account
2. Click "New site from Git"
3. Connect to your Git provider and select your repository
4. Configure the deployment settings:
   - Build command: `npm run build` or `pnpm run build` (depending on your package manager)
   - Publish directory: `dist`
5. Click "Deploy site"

### Option 2: Deploy via Netlify CLI

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Log in to Netlify: `netlify login`
3. Initialize your site: `netlify init`
4. Follow the prompts to configure your site
5. Deploy your site: `netlify deploy --prod`

## Environment Variables

If your application requires environment variables, you can set them in the Netlify UI:

1. Go to Site settings > Build & deploy > Environment
2. Add your environment variables

## Troubleshooting

- If you encounter build errors, check the build logs in the Netlify UI
- Ensure all dependencies are correctly listed in your package.json
- Verify that your application works locally with `npm run build` or `pnpm run build`

## Post-Deployment

After successful deployment, you can:

1. Configure a custom domain in the Netlify UI
2. Enable HTTPS
3. Set up form handling if needed
4. Configure additional redirect rules if required