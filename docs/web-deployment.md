# Web Deployment Guide

## Quick Web Deployment

### Local Development

1. **Add your Gemini API key to `.env.local`:**
```bash
echo "GEMINI_API_KEY=your_actual_key_here" > .env.local
```

2. **Run the web version:**
```bash
yarn web
```

### Production Deployment Options

## Option 1: Vercel (Recommended - Fastest)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
# Build for web
yarn build:web

# Deploy to Vercel
vercel

# During first deployment, add environment variable when prompted:
# GEMINI_API_KEY = your_actual_key
```

3. **Or use Vercel Dashboard:**
   - Push code to GitHub
   - Import project at https://vercel.com/new
   - Add environment variable: `GEMINI_API_KEY`
   - Deploy

## Option 2: Netlify

1. **Create `netlify.toml`:**
```toml
[build]
  command = "yarn build:web"
  publish = "web-build"

[build.environment]
  GEMINI_API_KEY = "set_in_netlify_dashboard"
```

2. **Deploy:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

3. **Add API key in Netlify Dashboard:**
   - Go to Site settings → Environment variables
   - Add `GEMINI_API_KEY`

## Option 3: GitHub Pages (Public Repo Only)

⚠️ **WARNING**: This exposes your API key in the build. Use only for demos with restricted API keys.

1. **GitHub Actions (`.github/workflows/deploy.yml`):**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: yarn install --frozen-lockfile
        
      - name: Build
        run: yarn build:web
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./web-build
```

2. **Add secret in GitHub:**
   - Go to Settings → Secrets → Actions
   - Add `GEMINI_API_KEY`

## Option 4: Static Hosting with Runtime Config

For more security, you can prompt users for their own API key:

1. **Update `geminiService.ts`:**
```typescript
// Add method to set API key from user input
async initializeWithUserKey(apiKey: string): Promise<void> {
  await this.storeApiKey(apiKey);
  await this.initialize(apiKey);
}
```

2. **Add API key input screen for web:**
```typescript
// Create ApiKeyScreen.tsx for web users
if (!geminiService.isInitialized() && Platform.OS === 'web') {
  return <ApiKeyInputScreen onSubmit={handleApiKeySubmit} />;
}
```

## Security Best Practices

### For Production:

1. **Use server-side proxy (Most Secure):**
   - Create a backend API that holds the Gemini key
   - Web app calls your API, not Gemini directly
   - Implement rate limiting and authentication

2. **Use restricted API keys:**
   - Create API keys with domain restrictions in Google Cloud Console
   - Limit to your production domain only

3. **Environment-specific keys:**
   - Use different keys for dev/staging/production
   - Set usage limits on each key

### Quick & Dirty (Demo/MVP):

For quick demos, using `GEMINI_API_KEY` in Vercel/Netlify is fine, but:
- Set daily spending limits on your API key
- Monitor usage in Google Cloud Console
- Rotate keys regularly

## Deployment Commands

### Quick Vercel Deploy:
```bash
# One-line deploy with environment variable
GEMINI_API_KEY=your_key yarn build:web && vercel --prod
```

### Quick Netlify Deploy:
```bash
# One-line deploy (add key in dashboard after)
yarn build:web && netlify deploy --prod --dir=web-build
```

### Local Preview:
```bash
# Test production build locally
yarn build:web
npx serve web-build
```

## Post-Deployment

1. **Test the deployment:**
   - Complete a questionnaire
   - Verify joke generation works
   - Test main chat functionality

2. **Monitor API usage:**
   - Check Google Cloud Console for API calls
   - Set up billing alerts

3. **Add domain (optional):**
   - Vercel: Add custom domain in project settings
   - Netlify: Add custom domain in domain settings

## Troubleshooting

### API Key Not Working:
- Check browser console for errors
- Verify key starts with `AIza`
- Ensure Gemini API is enabled in Google Cloud Console

### CORS Issues:
- Gemini API should work from browser directly
- If issues, check domain restrictions on API key

### Build Failures:
```bash
# Clear cache and rebuild
rm -rf web-build .expo node_modules
yarn install
yarn build:web
```

## Quick Start (Fastest Path):

1. **Get Gemini API Key:**
   - Go to https://makersuite.google.com/app/apikey
   - Create new API key

2. **Deploy to Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Build and deploy
echo "GEMINI_API_KEY=your_key" > .env.local
yarn build:web
vercel --prod
```

3. **Share your app URL!**

Your app will be live in ~2 minutes at `https://your-app.vercel.app`