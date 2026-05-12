# CryptoVault Backend

Complete Node.js/Express backend for the CryptoVault mobile app.

## Features

✅ User authentication (JWT)  
✅ Wallet management  
✅ Transaction tracking  
✅ Cryptocurrency price data  
✅ WebSocket real-time updates  
✅ Deposit/Withdrawal processing  
✅ User notifications  

## Tech Stack

- **Node.js** + **Express.js**
- **TypeScript**
- **JWT Authentication**
- **Socket.io** for WebSocket
- **Bcrypt** for password hashing
- **In-memory database** (upgrade to PostgreSQL/MongoDB)

## Quick Start

```bash
npm install
npm run dev
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Wallet
- `GET /api/wallet/balance` - Get balance
- `POST /api/wallet/deposit/create` - Create deposit
- `POST /api/wallet/withdraw` - Withdraw funds
- `POST /api/wallet/transfer` - Transfer funds

### Transactions
- `GET /api/transactions` - Get transactions (paginated)

### Crypto
- `GET /api/crypto` - Get all cryptocurrencies
- `GET /api/crypto/prices` - Get crypto prices

### Notifications
- `GET /api/notifications` - Get notifications

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions to Render or Railway.

**TL;DR:**
1. Push to GitHub
2. Connect to Render/Railway
3. Set environment variables
4. Deploy ✅

## Database

Currently uses in-memory storage for MVP. For production, upgrade to:
- PostgreSQL (recommended)
- MongoDB
- Supabase

See DEPLOYMENT.md for database setup instructions.

## Environment Variables

See `.env.example` for all available configurations.

Key variables:
- `JWT_SECRET` - JWT signing key
- `PORT` - Server port (default: 5000)
- `CORS_ORIGIN` - Allowed origins
- `NODE_ENV` - development/production

## WebSocket

Real-time price updates via Socket.io
```
wss://api.cryptovaultpro.finance/socket.io/
```

## Development

```bash
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm start            # Run compiled code
```

## Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Enable HTTPS/TLS
- [ ] Set `NODE_ENV=production`
- [ ] Use real database (PostgreSQL/MongoDB)
- [ ] Configure CORS properly
- [ ] Set up monitoring/logging
- [ ] Enable rate limiting
- [ ] Add email service for notifications

---

**Ready to deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md)
