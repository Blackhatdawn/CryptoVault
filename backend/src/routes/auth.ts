import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import {
  generateTokens,
  createUser,
  getUserByEmail,
  getUserById,
  comparePassword,
} from '../utils/auth.js';

const router = Router();

// Sign up
router.post('/signup', (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (getUserByEmail(email)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = createUser(email, password, fullName);
    const { access_token, refresh_token } = generateTokens(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      tokens: { access_token, refresh_token },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = getUserByEmail(email);
    if (!user || !comparePassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { access_token, refresh_token } = generateTokens(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      tokens: { access_token, refresh_token },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh token
router.post('/refresh', (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = require('jsonwebtoken').verify(
      refresh_token,
      process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key'
    );

    const { access_token, refresh_token: newRefreshToken } = generateTokens(decoded.userId);

    res.json({
      access_token,
      refresh_token: newRefreshToken,
    });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Get current user
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = getUserById(req.userId!);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      wallet: user.wallet,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
