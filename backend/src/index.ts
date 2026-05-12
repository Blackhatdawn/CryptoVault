import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import authRouter from './routes/auth.js';
import walletRouter from './routes/wallet.js';
import transactionRouter from './routes/transactions.js';
import cryptoRouter from './routes/crypto.js';
import notificationRouter from './routes/notifications.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  path: '/socket.io/',
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/crypto', cryptoRouter);
app.use('/api/notifications', notificationRouter);

// WebSocket events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('subscribe_prices', (cryptoIds: string[]) => {
    socket.join(`prices:${cryptoIds.join(',')}`);
    socket.emit('subscribed', { message: 'Subscribed to price updates' });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Store io instance for route access
app.set('io', io);

// Error handling
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket available at ws://localhost:${PORT}`);
  console.log(`🌍 CORS enabled for: ${process.env.CORS_ORIGIN || '*'}`);
});

export default app;
