import { Router, Response } from 'express';
import axios from 'axios';

const router = Router();

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Mock crypto data
const mockCryptos = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
  { id: 'cardano', symbol: 'ada', name: 'Cardano' },
  { id: 'solana', symbol: 'sol', name: 'Solana' },
  { id: 'ripple', symbol: 'xrp', name: 'Ripple' },
];

// Get all cryptocurrencies
router.get('/', (req: any, res: Response) => {
  try {
    res.json({
      data: mockCryptos,
      total: mockCryptos.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get crypto prices
router.get('/prices', async (req: Response) => {
  try {
    // Mock prices - in production, fetch from CoinGecko
    const prices = {
      bitcoin: 45000,
      ethereum: 2800,
      cardano: 0.95,
      solana: 180,
      ripple: 2.50,
    };

    res.json({
      data: prices,
      timestamp: new Date().toISOString(),
      source: 'coingecko',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
