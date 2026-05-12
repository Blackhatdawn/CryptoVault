import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { getUserById, updateUser } from '../utils/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get wallet balance
router.get('/balance', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = getUserById(req.userId!);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      balance: user.wallet.balance || 0,
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create deposit request
router.post('/deposit/create', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || !paymentMethod) {
      return res.status(400).json({ error: 'Amount and payment method required' });
    }

    const user = getUserById(req.userId!);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const depositId = uuidv4();
    const deposit = {
      id: depositId,
      userId: req.userId,
      amount,
      paymentMethod,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    user.wallet.deposits = user.wallet.deposits || [];
    user.wallet.deposits.push(deposit);
    updateUser(req.userId!, user);

    res.status(201).json({
      id: depositId,
      amount,
      status: 'pending',
      paymentInstructions: {
        bankName: 'Sample Bank',
        accountNumber: '****1234',
        routingNumber: '****5678',
        reference: depositId,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw funds
router.post('/withdraw', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { amount, bankAccount } = req.body;

    if (!amount || !bankAccount) {
      return res.status(400).json({ error: 'Amount and bank account required' });
    }

    const user = getUserById(req.userId!);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const withdrawalId = uuidv4();
    const withdrawal = {
      id: withdrawalId,
      userId: req.userId,
      amount,
      bankAccount,
      status: 'processing',
      createdAt: new Date(),
    };

    user.wallet.withdrawals = user.wallet.withdrawals || [];
    user.wallet.withdrawals.push(withdrawal);
    user.wallet.balance -= amount;
    updateUser(req.userId!, user);

    res.json({
      id: withdrawalId,
      amount,
      status: 'processing',
      estimatedTime: '2-3 business days',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer funds
router.post('/transfer', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { amount, recipientEmail } = req.body;

    if (!amount || !recipientEmail) {
      return res.status(400).json({ error: 'Amount and recipient email required' });
    }

    const user = getUserById(req.userId!);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const transferId = uuidv4();
    user.wallet.balance -= amount;
    updateUser(req.userId!, user);

    res.json({
      id: transferId,
      amount,
      recipientEmail,
      status: 'completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
