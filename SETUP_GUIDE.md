# 🚀 CryptoVault - Complete Setup Guide

Get your CryptoVault platform running in under 30 minutes!

## 📋 Prerequisites

- GitHub account
- Render.com or Railway.app account (free)
- Custom domain: `cryptovaultpro.finance` (with DNS access)
- Node.js 18+ (for local testing)

---

## 🎯 Phase 1: Deploy Backend (10 minutes)

### Step 1: Prepare Backend Files
Backend is ready in `/backend` directory. Push to GitHub:

```bash
cd /workspaces/CryptoVault
git add backend/
git commit -m "feat: Add backend API server"
git push origin main
```

### Step 2: Deploy to Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Select your CryptoVault repository
5. Configure:
   - **Name**: `cryptovault-backend`
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: `production`

6. Add Environment Variables:
```
JWT_SECRET=generate_a_random_secure_string_here_12345678
JWT_REFRESH_SECRET=generate_another_random_secure_string_9876543
CORS_ORIGIN=https://cryptovaultpro.finance,http://localhost:19000
NODE_ENV=production
PORT=5000
```

7. Click "Create Web Service"
8. Wait 2-3 minutes for deployment
9. Copy your Render URL (e.g., `https://cryptovault-backend-xyz.onrender.com`)

### Step 3: Connect Custom Domain to Backend

#### For Render:

1. In your Render service dashboard, click "Settings"
2. Scroll to "Custom Domain"
3. Add: `api.cryptovaultpro.finance`
4. Note the CNAME target value
5. Update your domain registrar DNS:
   - Type: `CNAME`
   - Name: `api`
   - Value: `[your-render-url].onrender.com`
6. Wait 5-10 minutes for DNS propagation

### Step 4: Verify Backend

Test the backend is running:

```bash
# Should return {"status":"ok",...}
curl https://api.cryptovaultpro.finance/health
```

---

## 📱 Phase 2: Configure Mobile App (5 minutes)

### Step 1: Create Environment File

In project root, create `.env.production`:

```env
EXPO_PUBLIC_API_URL=https://api.cryptovaultpro.finance
EXPO_PUBLIC_WS_URL=wss://api.cryptovaultpro.finance
EXPO_PUBLIC_APP_NAME=CryptoVault
EXPO_PUBLIC_SITE_NAME=CryptoVault Financial
EXPO_PUBLIC_SUPPORT_EMAIL=support@cryptovaultpro.finance
EXPO_PUBLIC_FEATURE_2FA_ENABLED=true
EXPO_PUBLIC_FEATURE_DEPOSITS_ENABLED=true
EXPO_PUBLIC_FEATURE_WITHDRAWALS_ENABLED=true
EXPO_PUBLIC_FEATURE_TRADING_ENABLED=true
```

### Step 2: Verify App Configuration

Open [constants/config.ts](constants/config.ts) and confirm it reads from environment:

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.cryptovaultpro.finance',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'wss://api.cryptovaultpro.finance',
  // ...
};
```

### Step 3: Build & Deploy App

```bash
# Install dependencies
npm install

# Test locally first
npm run dev

# Build for production
npm run build
```

---

## 🧪 Phase 3: Testing (5 minutes)

### Test 1: Backend API Health

```bash
curl -s https://api.cryptovaultpro.finance/health | jq .
```

### Test 2: User Registration

Open your mobile app and:
1. Click "Sign Up"
2. Register with test account:
   - Email: `test@cryptovaultpro.finance`
   - Password: `Test123!@`
   - Name: `Test User`
3. Should see dashboard with $0.00 balance

### Test 3: User Login

1. Logout
2. Login with test credentials
3. Should authenticate successfully

### Test 4: Get Crypto Prices

1. Navigate to Markets tab
2. Should see price data loading
3. WebSocket should connect for real-time updates

---

## 🔧 Phase 4: Production Setup (10 minutes)

### Email Service Setup (Optional)

For transactional emails:

```bash
# Install email provider (SendGrid recommended)
cd backend
npm install sendgrid dotenv
```

Update `backend/.env`:
```
SENDGRID_API_KEY=SG.your_api_key
SUPPORT_EMAIL=noreply@cryptovaultpro.finance
```

### Database Upgrade (For Scale)

Once ready to scale, upgrade from in-memory to PostgreSQL:

```bash
cd backend
npm install pg
```

Update `backend/.env`:
```
DATABASE_URL=postgresql://user:password@host:5432/cryptovault
```

### Security Hardening

1. ✅ JWT secrets are strong (regenerate if needed)
2. ✅ CORS restricted to your domain
3. ✅ HTTPS enabled (automatic on Render)
4. ✅ Environment secrets not in version control

### Monitoring

Login to Render/Railway dashboard to:
- View real-time logs
- Monitor CPU/Memory usage
- Set up alerts for errors
- Check deployment history

---

## ✅ Checklist - System Running

- [ ] Backend deployed to Render
- [ ] Custom domain `api.cryptovaultpro.finance` resolves
- [ ] `/health` endpoint returns 200
- [ ] Mobile app environment configured
- [ ] User registration working
- [ ] User login working
- [ ] Crypto prices displaying
- [ ] WebSocket connecting

---

## 🚨 Troubleshooting

### "Cannot reach backend"
```bash
# Test DNS
nslookup api.cryptovaultpro.finance

# Test endpoint
curl -v https://api.cryptovaultpro.finance/health

# Check backend logs in Render dashboard
```

### "CORS Error"
Update backend `CORS_ORIGIN` in Render environment:
```
CORS_ORIGIN=https://cryptovaultpro.finance,http://localhost:19000
```

### "Mobile app won't connect"
1. Verify `EXPO_PUBLIC_API_URL` is set in `.env.production`
2. Test with: `curl $EXPO_PUBLIC_API_URL/health`
3. Check that JWT secrets are set

### WebSocket Connection Failed
1. Ensure `EXPO_PUBLIC_WS_URL` uses `wss://` (secure)
2. Verify backend `SOCKET_IO_PATH=/socket.io/`
3. Check Render logs for WebSocket errors

---

## 📞 Support

For issues:

1. **Backend not starting?** Check Render logs
2. **API returning 500?** Check error handler in logs
3. **Mobile app crashes?** Check network inspector
4. **Domain not resolving?** Wait 24 hours for DNS, check registrar

---

## 🎉 You're Live!

Your CryptoVault platform is now running with:
- ✅ Live backend API
- ✅ Custom domain
- ✅ Mobile app connected
- ✅ User accounts working
- ✅ Real-time price updates

### Next Steps

1. Create test accounts
2. Test deposit/withdraw flows
3. Monitor user activity
4. Gather feedback from users
5. Deploy additional features

---

**Questions?** See detailed docs:
- [Backend Setup](./backend/DEPLOYMENT.md)
- [Mobile App Configuration](./APP_SETUP.md)
- [API Documentation](./backend/README.md)
