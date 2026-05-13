#!/bin/bash
# All traffic goes through port 5000 (the only externally accessible port in Replit)
# The proxy at port 5000 routes: /api/* → backend:3000, everything else → metro:8081

cat > /home/runner/workspace/.env << EOF
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_WS_URL=
EXPO_PUBLIC_SOCKET_IO_PATH=/socket.io/
EXPO_PUBLIC_SUPABASE_URL=https://xssekmwtjtzdwobodnup.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzc2VrbXd0anR6ZHdvYm9kbnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzI1OTYsImV4cCI6MjA5MDE0ODU5Nn0.cvSzfo7dokNgVSoLMkOIUrXKu62uxhcIlSq2mYLj6jo
EXPO_PUBLIC_APP_NAME=CryptoVault
EXPO_PUBLIC_APP_VERSION=2.0.0
EXPO_PUBLIC_SITE_NAME=CryptoVault Financial
EXPO_PUBLIC_SUPPORT_EMAIL=support@cryptovault.financial
EXPO_PUBLIC_FEATURE_2FA_ENABLED=true
EXPO_PUBLIC_FEATURE_DEPOSITS_ENABLED=true
EXPO_PUBLIC_FEATURE_WITHDRAWALS_ENABLED=true
EXPO_PUBLIC_FEATURE_TRADING_ENABLED=true
EXPO_PUBLIC_FEATURE_STAKING_ENABLED=false
EOF

echo "Starting proxy gateway on port 5000, Metro on port 8081"

# Start proxy gateway in background
node proxy.mjs &
PROXY_PID=$!

# Start Metro bundler on port 8081 (internal only)
export EXPO_NO_METRO_HOST_CHECKING=true
npx expo start --web --port 8081 --host lan

# Cleanup on exit
kill $PROXY_PID 2>/dev/null
