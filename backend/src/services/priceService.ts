import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const CACHE_TTL_MS = 60_000; // 60 seconds — respects CoinGecko free-tier rate limits

export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
}

interface PriceCache {
  data: CoinPrice[];
  fetchedAt: number;
}

let cache: PriceCache | null = null;
let inflight: Promise<CoinPrice[]> | null = null; // prevent duplicate concurrent fetches

export async function fetchPrices(): Promise<CoinPrice[]> {
  const now = Date.now();

  // Return cached data if still fresh
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  // Coalesce concurrent callers onto a single in-flight request
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 20,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h',
        },
        timeout: 10_000,
        headers: {
          Accept: 'application/json',
        },
      });

      const data: CoinPrice[] = (response.data as any[]).map((coin) => ({
        id: String(coin.id),
        symbol: String(coin.symbol).toUpperCase(),
        name: String(coin.name),
        priceUsd: String(coin.current_price ?? 0),
        changePercent24Hr: Number(coin.price_change_percentage_24h ?? 0).toFixed(2),
        marketCapUsd: String(coin.market_cap ?? 0),
        volumeUsd24Hr: String(coin.total_volume ?? 0),
      }));

      cache = { data, fetchedAt: Date.now() };
      return data;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/** Returns stale cached data without triggering a network request. */
export function getCachedPrices(): CoinPrice[] {
  return cache?.data ?? [];
}

/** Invalidates the cache, forcing the next fetchPrices() to hit the network. */
export function invalidateCache(): void {
  cache = null;
}
