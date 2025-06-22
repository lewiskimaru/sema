# Netlify Deployment Guide for Sema AI Frontend

## 🚀 Quick Deployment Steps

### 1. Pre-deployment Checklist

✅ **Build Success**: Your project builds successfully with `npm run build`
✅ **Configuration Files**: `netlify.toml` and `_redirects` are properly configured
✅ **Environment Variables**: Ready to configure in Netlify dashboard

### 2. Deploy to Netlify

#### Option A: Git-based Deployment (Recommended)

1. **Push to GitHub/GitLab**:
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "New site from Git"
   - Choose your Git provider (GitHub/GitLab)
   - Select your repository
   - Configure build settings:
     - **Base directory**: `frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `frontend/dist`

#### Option B: Manual Deployment

1. **Build locally**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy via Netlify UI**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `frontend/dist` folder to deploy

### 3. Environment Variables Configuration

In your Netlify site dashboard:

1. Go to **Site settings** → **Build & deploy** → **Environment variables**
2. Add the following variables:

```bash
# Required: Backend API URL
VITE_API_URL=https://your-backend-api-url.com

# Optional: HuggingFace token for chat functionality
VITE_HF_TOKEN=your_huggingface_token_here
```

**Important Notes**:
- `VITE_API_URL`: Point this to your deployed backend API (HuggingFace Spaces, Railway, etc.)
- `VITE_HF_TOKEN`: Only needed if you want chat functionality to work
- All Vite environment variables must be prefixed with `VITE_`

### 4. Build Configuration

Your `netlify.toml` is already configured:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 5. Post-Deployment Verification

After deployment, verify:

1. **Site loads correctly**: Check your Netlify URL
2. **Routing works**: Navigate between pages (/, /about)
3. **API connectivity**: Test translation functionality
4. **Console errors**: Check browser console for any issues

## 🔧 Troubleshooting

### Common Issues

**Build Fails**:
- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation passes locally

**API Not Working**:
- Check `VITE_API_URL` environment variable
- Ensure backend is deployed and accessible
- Check CORS settings on backend

**Chat Not Working**:
- Verify `VITE_HF_TOKEN` is set
- Check HuggingFace token permissions

### Build Logs

If build fails, check the logs for:
- Missing dependencies
- TypeScript errors
- Environment variable issues

## 📱 Features Included

Your deployed app includes:
- ✅ Translation functionality
- ✅ Chat with AI (if HF token configured)
- ✅ Language detection
- ✅ Responsive design
- ✅ Caching for performance
- ✅ SPA routing
- ✅ Professional UI

## 🌐 Next Steps

1. **Custom Domain**: Configure in Netlify dashboard
2. **SSL Certificate**: Automatically provided by Netlify
3. **Performance**: Monitor Core Web Vitals
4. **Analytics**: Add Netlify Analytics if needed

## 📞 Support

If you encounter issues:
1. Check Netlify build logs
2. Verify environment variables
3. Test locally with `npm run build && npm run preview`
4. Check browser console for errors

Your app is now ready for production! 🎉
