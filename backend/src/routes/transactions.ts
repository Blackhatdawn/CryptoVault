import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { getUserById } from '../utils/auth.js';

const router = Router();

// Get transactions
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = getUserById(req.userId!);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const allTransactions = [
      ...(user.wallet.deposits || []).map((d: any) => ({
        id: d.id,
        type: 'deposit',
        amount: d.amount,
        status: d.status,
        createdAt: d.createdAt,
      })),
      ...(user.wallet.withdrawals || []).map((w: any) => ({
        id: w.id,
        type: 'withdrawal',
        amount: w.amount,
        status: w.status,
        createdAt: w.createdAt,
      })),
    ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const start = (page - 1) * limit;
    const end = start + limit;

    res.json({
      data: allTransactions.slice(start, end),
      pagination: {
        page,
        limit,
        total: allTransactions.length,
        pages: Math.ceil(allTransactions.length / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
