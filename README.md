# CryptoVault Mobile App

A secure cryptocurrency wallet and trading mobile application built with React Native and Expo.

## Features

- 🔐 **Biometric Authentication** - Face ID / Touch ID support
- 💰 **Wallet Management** - Multi-currency balance tracking
- 📊 **Live Price Feed** - Real-time WebSocket cryptocurrency prices
- 💸 **Deposits** - Create crypto deposits via NOWPayments
- 🔄 **P2P Transfers** - Instant transfers between users
- 📤 **Withdrawals** - Secure withdrawal requests with admin approval
- 📈 **Markets** - Browse and search cryptocurrency prices
- 📜 **Transaction History** - Complete transaction tracking
- 🔔 **Notifications** - Real-time alerts and updates
- 📱 **Price Alerts** - Set custom price notifications

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for navigation
- **Context API** for state management
- **WebSocket** for real-time updates
- **Expo Local Authentication** for biometric support
- **Expo Camera** for QR code scanning

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd cryptovault-mobile
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and configure your backend URL:
```env
EXPO_PUBLIC_API_URL=https://cryptovault-api.onrender.com
EXPO_PUBLIC_WS_URL=wss://cryptovault-api.onrender.com
```

## Running the App

### Development Mode

**Start the development server:**
```bash
npm start
# or
yarn start
```

**Run on iOS Simulator:**
```bash
npm run ios
# or
yarn ios
```

**Run on Android Emulator:**
```bash
npm run android
# or
yarn android
```

**Run on Web:**
```bash
npm run web
# or
yarn web
```

### Production Build

**Build for iOS:**
```bash
eas build --platform ios
```

**Build for Android:**
```bash
eas build --platform android
```

## Backend Connection

This app connects to the CryptoVault backend API at:
- **Production:** `https://cryptovault-api.onrender.com`
- **Local Development:** `http://localhost:8001`

Switch between environments by updating the `.env` file.

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Bottom tab navigation
│   │   ├── index.tsx      # Wallet screen
│   │   ├── markets.tsx    # Markets screen
│   │   ├── history.tsx    # Transaction history
│   │   └── account.tsx    # Account/Profile
│   ├── auth.tsx           # Login/Signup
│   ├── deposit.tsx        # Deposit creation
│   ├── withdraw.tsx       # Withdrawal request
│   ├── transfer.tsx       # P2P transfer
│   ├── settings.tsx       # Settings
│   ├── notifications.tsx  # Notifications
│   ├── price-alert.tsx    # Price alerts
│   ├── qr-scanner.tsx     # QR code scanner
│   ├── onboarding.tsx     # Onboarding flow
│   └── splash.tsx         # Splash screen
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── PriceCard.tsx     # Price display card
│   ├── TransactionItem.tsx # Transaction list item
│   └── QuickActions.tsx  # Quick action buttons
├── contexts/             # React contexts
│   ├── AuthContext.tsx   # Auth state
│   └── WalletContext.tsx # Wallet state
├── hooks/                # Custom hooks
│   ├── useAuth.ts        # Auth hook
│   ├── useWallet.ts      # Wallet hook
│   ├── usePrices.ts      # Price data hook
│   └── useLivePrices.ts  # WebSocket prices
├── services/             # API services
│   ├── api.ts            # HTTP client
│   └── websocket.ts      # WebSocket client
├── constants/            # App constants
│   ├── theme.ts          # Design system
│   └── config.ts         # App configuration
└── types/                # TypeScript types
    └── index.ts
```

## Environment Variables

All environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app.

**Required:**
- `EXPO_PUBLIC_API_URL` - Backend API URL
- `EXPO_PUBLIC_WS_URL` - WebSocket URL

**Optional:**
- `EXPO_PUBLIC_SENTRY_DSN` - Error tracking
- `EXPO_PUBLIC_FEATURE_*` - Feature flags

See `.env.example` for all available options.

## Design System

The app uses a dark crypto-themed design:
- **Colors:** Gold (#FFD700) primary, dark backgrounds
- **Typography:** Responsive font sizes with proper line heights
- **Spacing:** 8pt grid system
- **Components:** Reusable UI components with consistent styling

## Authentication

1. **Email/Password** - Initial signup and login
2. **Biometric** - Quick login with Face ID/Touch ID
3. **JWT Tokens** - Secure token-based authentication
4. **Auto-refresh** - Automatic token refresh for sessions

## Features

### Wallet Management
- View total balance (USD)
- See available vs locked funds
- Quick actions (Deposit, Withdraw, Transfer)
- Live price feed on main screen

### Deposits
- Select cryptocurrency (BTC, ETH, USDT, USDC)
- Generate payment address via NOWPayments
- Display QR code and copy address
- Real-time status updates

### Withdrawals
- Select cryptocurrency
- Enter withdrawal address
- Calculate network fees
- Biometric confirmation required
- Admin approval workflow

### Transfers
- Send to other users by email
- Instant and free
- Transaction history tracking

### Markets
- Live cryptocurrency prices
- Search and filter
- Sort by price or 24h change
- Real-time WebSocket updates

### Price Alerts
- Set custom price targets
- Choose condition (above/below)
- Receive notifications when triggered

## Troubleshooting

**Can't connect to backend:**
- Check `.env` file has correct API URL
- Verify backend is running
- Check network connection

**Biometric not working:**
- Ensure device has Face ID/Touch ID enabled
- Grant app permissions
- Check Settings > Biometric Login toggle

**WebSocket disconnected:**
- Check internet connection
- Backend may be restarting
- App auto-reconnects with exponential backoff

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit pull request

## License

MIT License - see LICENSE file for details

## Support

- **Email:** support@cryptovault.financial
- **Documentation:** See backend docs at cryptovault-api.onrender.com/docs

---

**Version:** 2.0.0  
**Last Updated:** 2026-02-11  
**Status:** Production Ready
