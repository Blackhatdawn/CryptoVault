# CryptoVault Backend Setup Guide

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env and set your configuration values
```

### 3. Run Development Server
```bash
npm run dev
```

Server will start at `http://localhost:5000`

---

## 🚀 Deploy to Render (Recommended - 5 minutes)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"

### Step 2: Connect Your Repository
1. Select your GitHub repo (CryptoVault)
2. Choose branch: `main`
3. Fill in settings:
   - **Name**: `cryptovault-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `production`

### Step 3: Add Environment Variables
Add in Render dashboard:
```
JWT_SECRET=your_very_secure_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_here_min_32_chars
CORS_ORIGIN=https://cryptovaultpro.finance,http://localhost:19000
NODE_ENV=production
PORT=5000
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait ~2-3 minutes for deployment
3. Get your URL: `https://cryptovault-backend-xxxxx.onrender.com`

### Step 5: Connect Your Domain
1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domain"
3. Add: `api.cryptovaultpro.finance`
4. Update your DNS records (instructions in Render dashboard):
   ```
   CNAME: api.cryptovaultpro.finance → your-render-url.onrender.com
   ```

---

## 🚀 Deploy to Railway (Alternative)

### Step 1: Connect Repository
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Connect GitHub repo

### Step 2: Create Node Service
1. Select "Node.js"
2. Template will auto-detect `package.json`

### Step 3: Configure
1. Go to Variables tab
2. Add your environment variables
3. Go to Deploy tab
4. Set build command: `npm run build`
5. Set start command: `npm start`

### Step 4: Connect Custom Domain
1. Go to Settings
2. Under "Domains", add: `api.cryptovaultpro.finance`
3. Update DNS CNAME records

---

## 🌐 Update App Configuration

After deploying, update your mobile app to point to your domain:

### Edit `constants/config.ts`

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.cryptovaultpro.finance',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'wss://api.cryptovaultpro.finance',
  // ... rest of config
};
```

Or set environment variables:
```bash
EXPO_PUBLIC_API_URL=https://api.cryptovaultpro.finance
EXPO_PUBLIC_WS_URL=wss://api.cryptovaultpro.finance
```

---

## ✅ Test Your Backend

### Test Health Check
```bash
curl https://api.cryptovaultpro.finance/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-05-12T10:30:00.000Z"
}
```

### Test Sign Up
```bash
curl -X POST https://api.cryptovaultpro.finance/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "fullName": "Test User"
  }'
```

### Test Login
```bash
curl -X POST https://api.cryptovaultpro.finance/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

---

## 🔒 Database Upgrade (Production)

Currently using in-memory storage. For production, upgrade to:

### Option 1: PostgreSQL (Recommended)
- Install: `npm install pg`
- Add to Render: "Postgres Database"
- Update connection string in `.env`

### Option 2: MongoDB
- Use MongoDB Atlas (free tier available)
- Install: `npm install mongoose`
- Connection string in `.env`

### Option 3: Supabase
- Free PostgreSQL hosting
- Install: `npm install @supabase/supabase-js`
- Get connection string from Supabase dashboard

---

## 📊 Monitoring & Logs

### View Logs
**Render**: Service Dashboard → "Logs" tab
**Railway**: Deployments → "Logs" tab

### Monitor Performance
Add to `.env`:
```
LOG_LEVEL=debug
```

---

## 🛠️ Troubleshooting

### CORS Errors?
Update `CORS_ORIGIN` in environment to include your domain:
```
CORS_ORIGIN=https://cryptovaultpro.finance,https://app.cryptovaultpro.finance,http://localhost:19000
```

### Port Already in Use?
Change `PORT` in `.env` to different value

### WebSocket Not Connecting?
Ensure `WS_URL` matches your domain with `wss://` prefix (secured WebSocket)

---

## 📝 Next Steps

1. ✅ Deploy backend to Render/Railway
2. ✅ Configure custom domain
3. ✅ Update app API URL configuration
4. ✅ Test API endpoints
5. ✅ Upgrade database for production
6. ✅ Set up SSL certificate (usually automatic)
7. ✅ Configure email service for notifications

---

**Need help?** Check backend logs and test endpoints with the curl commands above.
