import { Router, Response } from 'express';
import { fetchPrices } from '../services/priceService.js';

const router = Router();

// GET /api/crypto — list of supported coins
router.get('/', (_req: any, res: Response) => {
  res.json([
    { id: 'bitcoin',     symbol: 'BTC',  name: 'Bitcoin'  },
    { id: 'ethereum',    symbol: 'ETH',  name: 'Ethereum' },
    { id: 'tether',      symbol: 'USDT', name: 'Tether'   },
    { id: 'usd-coin',    symbol: 'USDC', name: 'USD Coin' },
    { id: 'binancecoin', symbol: 'BNB',  name: 'BNB'      },
    { id: 'solana',      symbol: 'SOL',  name: 'Solana'   },
    { id: 'ripple',      symbol: 'XRP',  name: 'XRP'      },
    { id: 'cardano',     symbol: 'ADA',  name: 'Cardano'  },
    { id: 'dogecoin',    symbol: 'DOGE', name: 'Dogecoin' },
    { id: 'polkadot',    symbol: 'DOT',  name: 'Polkadot' },
  ]);
});

// GET /api/crypto/prices — live prices from CoinGecko (60s cache)
router.get('/prices', async (_req: any, res: Response) => {
  try {
    const prices = await fetchPrices();
    res.json(prices);
  } catch (error: any) {
    console.error('CoinGecko fetch failed:', error.message);
    res.status(503).json({
      error: 'Price data temporarily unavailable. Please try again shortly.',
    });
  }
});

// GET /api/crypto/:symbol/history — price history stub
// Returns a basic array of price points (replace with real data later)
router.get('/:symbol/history', async (req: any, res: Response) => {
  try {
    const prices = await fetchPrices();
    const coin = prices.find((p) => p.symbol === req.params.symbol.toUpperCase());
    const base = coin ? parseFloat(coin.priceUsd) : 1000;

    // Generate 24 plausible price points around the current price
    const points = Array.from({ length: 24 }, (_, i) => {
      const variance = base * 0.015; // ±1.5%
      return parseFloat((base + (Math.random() - 0.5) * 2 * variance).toFixed(2));
    });

    res.json({ symbol: req.params.symbol.toUpperCase(), interval: req.query.interval || '1h', prices: points });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
