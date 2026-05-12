import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { getUserById } from '../utils/auth.js';

const router = Router();

// Get notifications
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = getUserById(req.userId!);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mock notifications
    const notifications = [
      {
        id: '1',
        type: 'price_alert',
        title: 'Bitcoin Alert',
        message: 'Bitcoin has reached your target price',
        read: false,
        createdAt: new Date(),
      },
    ];

    res.json({
      data: notifications,
      unread: notifications.filter((n) => !n.read).length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
