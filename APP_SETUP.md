# CryptoVault Mobile App - Environment Setup

## Production Configuration

To use your custom domain, create a `.env.production` file in the root:

```env
EXPO_PUBLIC_API_URL=https://api.cryptovaultpro.finance
EXPO_PUBLIC_WS_URL=wss://api.cryptovaultpro.finance
EXPO_PUBLIC_APP_NAME=CryptoVault
EXPO_PUBLIC_SITE_NAME=CryptoVault Financial
EXPO_PUBLIC_SUPPORT_EMAIL=support@cryptovaultpro.finance
EXPO_PUBLIC_API_TIMEOUT=30000

# Feature Flags
EXPO_PUBLIC_FEATURE_2FA_ENABLED=true
EXPO_PUBLIC_FEATURE_DEPOSITS_ENABLED=true
EXPO_PUBLIC_FEATURE_WITHDRAWALS_ENABLED=true 
EXPO_PUBLIC_FEATURE_TRADING_ENABLED=true
EXPO_PUBLIC_FEATURE_STAKING_ENABLED=false
```

## Development Configuration

For local development with Expo:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_WS_URL=ws://localhost:5000
```

## Build & Run

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
# Using environment variables
EXPO_PUBLIC_API_URL=https://api.cryptovaultpro.finance npm run build
```

## Domain Configuration

### Prerequisites
1. Backend deployed to: `api.cryptovaultpro.finance`
2. Domain DNS configured correctly

### Verify Connection
Test that your app can reach the backend:

```bash
curl https://api.cryptovaultpro.finance/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-05-12T..."
}
```

## Troubleshooting

### "Cannot reach backend"
- Verify `EXPO_PUBLIC_API_URL` is set correctly
- Check DNS is propagated: `nslookup api.cryptovaultpro.finance`
- Test with curl command above

### CORS Error
- Backend not running
- Domain not in backend's `CORS_ORIGIN` list

### WebSocket Connection Failed
- Ensure `EXPO_PUBLIC_WS_URL` uses `wss://` (secure WebSocket)
- Backend WebSocket support enabled

---

See backend [DEPLOYMENT.md](./backend/DEPLOYMENT.md) for backend setup.
