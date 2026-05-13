/**
 * CryptoVault — Production API Test Suite
 * Run: node test-api.mjs
 */

const BASE   = 'https://cryptovault-backend-mbkr.onrender.com';
const EMAIL  = `cv_test_${Date.now()}@test.io`;
const PASS   = 'TestPass999!';
const NAME   = 'CV Test User';

let token        = '';
let refreshTok   = '';
let limitOrderId = '';
let alertId      = '';

// ─── helpers ─────────────────────────────────────────────────────────────────
let passed = 0, failed = 0;

const green  = (s) => `\x1b[32m${s}\x1b[0m`;
const red    = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold   = (s) => `\x1b[1m${s}\x1b[0m`;
const dim    = (s) => `\x1b[2m${s}\x1b[0m`;

function ok(msg, extra = '')  { passed++; console.log(`  ${green('✔')} ${msg} ${dim(extra)}`); }
function fail(msg, detail='') { failed++; console.log(`  ${red('✘')} ${msg}`, detail ? red(JSON.stringify(detail).slice(0,120)) : ''); }
function warn(msg)            { console.log(`  ${yellow('⚠')} ${msg}`); }
function section(title)       { console.log(`\n${bold('━━━ ' + title + ' ━━━')}`); }

async function api(method, path, body = null, useAuth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (useAuth && token) headers['Authorization'] = `Bearer ${token}`;
  const t0  = Date.now();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const ms   = Date.now() - t0;
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, ms };
}

// ─── test runner ─────────────────────────────────────────────────────────────
async function run() {
  console.log(bold('\n🔬  CryptoVault Production API — Full Test Suite'));
  console.log(`${'─'.repeat(54)}`);
  console.log(`  Base URL  : ${BASE}`);
  console.log(`  Test user : ${EMAIL}`);
  console.log(`  Time      : ${new Date().toUTCString()}`);
  console.log(`${'─'.repeat(54)}`);

  // ── 1. HEALTH ──────────────────────────────────────────────────────────────
  section('1 · HEALTH');
  {
    const r = await api('GET', '/health', null, false);
    r.status === 200 && r.data.status === 'ok'
      ? ok(`GET /health  →  200`, `(${r.ms}ms)`)
      : fail(`GET /health  →  ${r.status}`, r.data);
  }

  // ── 2. PUBLIC PRICES ──────────────────────────────────────────────────────
  section('2 · CRYPTO PRICES (public — no auth)');
  {
    const r = await api('GET', '/api/crypto/prices', null, false);
    if (r.status === 200 && Array.isArray(r.data) && r.data.length > 0) {
      ok(`GET /api/crypto/prices  →  200`, `(${r.ms}ms  ${r.data.length} coins)`);
      const btc = r.data.find(c => c.symbol === 'BTC');
      btc
        ? ok(`BTC price live  →  $${Number(btc.priceUsd).toLocaleString()}  (${btc.changePercent24Hr}% 24h)`)
        : fail('BTC missing from price list');
      const eth = r.data.find(c => c.symbol === 'ETH');
      eth && ok(`ETH price live  →  $${Number(eth.priceUsd).toLocaleString()}`);
    } else {
      fail(`GET /api/crypto/prices  →  ${r.status}`, r.data);
    }

    const r2 = await api('GET', '/api/crypto', null, false);
    r2.status === 200 && Array.isArray(r2.data)
      ? ok(`GET /api/crypto  →  200`, `(${r2.data.length} coins listed)`)
      : fail(`GET /api/crypto  →  ${r2.status}`, r2.data);

    // History stub
    const r3 = await api('GET', '/api/crypto/BTC/history?interval=1h', null, false);
    r3.status === 200 && Array.isArray(r3.data.prices)
      ? ok(`GET /api/crypto/:symbol/history  →  200`, `(${r3.data.prices.length} data points)`)
      : fail(`GET /api/crypto/:symbol/history  →  ${r3.status}`, r3.data);
  }

  // ── 3. AUTH — SIGNUP ─────────────────────────────────────────────────────
  section('3 · AUTH — SIGNUP');
  {
    const r = await api('POST', '/api/auth/signup',
      { email: EMAIL, password: PASS, fullName: NAME }, false);

    if ((r.status === 200 || r.status === 201) && r.data.tokens?.access_token) {
      token      = r.data.tokens.access_token;
      refreshTok = r.data.tokens.refresh_token;
      ok(`POST /api/auth/signup  →  ${r.status}`, `(${r.ms}ms)`);
      ok(`User ID: ${r.data.user?.id}`);
      ok(`Token issued: ${token.slice(0, 24)}…`);
    } else {
      fail(`POST /api/auth/signup  →  ${r.status}`, r.data);
      warn('Attempting login as fallback…');
      const lr = await api('POST', '/api/auth/login', { email: EMAIL, password: PASS }, false);
      if (lr.status === 200 && lr.data.tokens?.access_token) {
        token = lr.data.tokens.access_token; refreshTok = lr.data.tokens.refresh_token;
        ok('Fallback login OK');
      } else { fail('Cannot obtain token — aborting authenticated tests'); return summarise(); }
    }

    // Duplicate signup
    const r2 = await api('POST', '/api/auth/signup',
      { email: EMAIL, password: PASS, fullName: NAME }, false);
    r2.status === 409
      ? ok('Duplicate email  →  409 Conflict')
      : fail(`Duplicate email should be 409, got ${r2.status}`, r2.data);

    // Weak password
    const r3 = await api('POST', '/api/auth/signup',
      { email: `weak_${Date.now()}@test.io`, password: 'abc', fullName: NAME }, false);
    r3.status === 400
      ? ok('Weak password (<8 chars)  →  400')
      : fail(`Weak password should be 400, got ${r3.status}`);

    // Invalid email
    const r4 = await api('POST', '/api/auth/signup',
      { email: 'not-an-email', password: PASS, fullName: NAME }, false);
    r4.status === 400
      ? ok('Invalid email format  →  400')
      : fail(`Invalid email should be 400, got ${r4.status}`);

    // Missing fields
    const r5 = await api('POST', '/api/auth/signup', { email: EMAIL }, false);
    r5.status === 400
      ? ok('Missing fields  →  400')
      : fail(`Missing fields should be 400, got ${r5.status}`);
  }

  // ── 4. AUTH — LOGIN ──────────────────────────────────────────────────────
  section('4 · AUTH — LOGIN');
  {
    const r = await api('POST', '/api/auth/login', { email: EMAIL, password: PASS }, false);
    if (r.status === 200 && r.data.tokens?.access_token) {
      token = r.data.tokens.access_token; refreshTok = r.data.tokens.refresh_token;
      ok(`POST /api/auth/login  →  200`, `(${r.ms}ms)`);
      ok(`Returned name: "${r.data.user?.name}"  kyc_verified: ${r.data.user?.kyc_verified}`);
    } else { fail(`POST /api/auth/login  →  ${r.status}`, r.data); }

    const r2 = await api('POST', '/api/auth/login', { email: EMAIL, password: 'wrongpass' }, false);
    r2.status === 401 ? ok('Wrong password  →  401') : fail(`Wrong password should be 401, got ${r2.status}`);

    const r3 = await api('POST', '/api/auth/login', { email: EMAIL }, false);
    r3.status === 400 ? ok('Missing password  →  400') : fail(`Missing password should be 400, got ${r3.status}`);
  }

  // ── 5. AUTH — ME ─────────────────────────────────────────────────────────
  section('5 · AUTH — GET ME');
  {
    const r = await api('GET', '/api/auth/me');
    if (r.status === 200 && r.data.id) {
      ok(`GET /api/auth/me  →  200`, `(${r.ms}ms)`);
      ok(`Profile: ${r.data.email}  |  ${r.data.name}`);
    } else { fail(`GET /api/auth/me  →  ${r.status}`, r.data); }

    const r2 = await api('GET', '/api/auth/me', null, false);
    r2.status === 401 ? ok('No token  →  401') : fail(`No token should be 401, got ${r2.status}`);
  }

  // ── 6. AUTH — TOKEN REFRESH ──────────────────────────────────────────────
  section('6 · AUTH — TOKEN REFRESH');
  {
    const r = await api('POST', '/api/auth/refresh', { refresh_token: refreshTok }, false);
    if (r.status === 200 && r.data.access_token) {
      token = r.data.access_token; refreshTok = r.data.refresh_token;
      ok(`POST /api/auth/refresh  →  200`, `(${r.ms}ms)`);
      ok(`New token: ${token.slice(0, 24)}…`);
    } else { fail(`POST /api/auth/refresh  →  ${r.status}`, r.data); }

    const r2 = await api('POST', '/api/auth/refresh', { refresh_token: 'garbage_token' }, false);
    r2.status === 401 ? ok('Invalid refresh token  →  401') : fail(`Should be 401, got ${r2.status}`);

    const r3 = await api('POST', '/api/auth/refresh', {}, false);
    r3.status === 401 ? ok('Missing refresh token  →  401') : fail(`Should be 401, got ${r3.status}`);
  }

  // ── 7. AUTH — PROFILE UPDATE ─────────────────────────────────────────────
  section('7 · AUTH — PROFILE UPDATE');
  {
    const r = await api('PUT', '/api/auth/profile', { name: 'Updated CV User', phone: '+1-555-0100' });
    if (r.status === 200 && r.data.user?.name === 'Updated CV User') {
      ok(`PUT /api/auth/profile  →  200`, `(${r.ms}ms)`);
      ok(`Name updated: "${r.data.user.name}"  phone: "${r.data.user.phone}"`);
    } else { fail(`PUT /api/auth/profile  →  ${r.status}`, r.data); }
  }

  // ── 8. AUTH — PASSWORD CHANGE ────────────────────────────────────────────
  section('8 · AUTH — PASSWORD CHANGE');
  {
    const r = await api('PUT', '/api/auth/password', { currentPassword: PASS, newPassword: PASS });
    r.status === 200
      ? ok(`PUT /api/auth/password  →  200  (same password re-set OK)`, `(${r.ms}ms)`)
      : fail(`PUT /api/auth/password  →  ${r.status}`, r.data);

    const r2 = await api('PUT', '/api/auth/password', { currentPassword: 'wrongpass', newPassword: 'NewPass999!' });
    r2.status === 401
      ? ok('Wrong current password  →  401')
      : fail(`Wrong current password should be 401, got ${r2.status}`, r2.data);

    const r3 = await api('PUT', '/api/auth/password', { currentPassword: PASS, newPassword: 'short' });
    r3.status === 400
      ? ok('New password too short  →  400')
      : fail(`Short password should be 400, got ${r3.status}`);
  }

  // ── 9. WALLET — BALANCE ──────────────────────────────────────────────────
  section('9 · WALLET — BALANCE');
  {
    const r = await api('GET', '/api/wallet/balance');
    if (r.status === 200 && r.data.total_usd !== undefined) {
      ok(`GET /api/wallet/balance  →  200`, `(${r.ms}ms)`);
      ok(`total_usd: $${r.data.total_usd}  available: $${r.data.available_usd}  locked: $${r.data.locked_usd}`);
      ok(`currency: ${r.data.currency}  user_id: ${r.data.user_id?.slice(0, 8)}…`);
    } else { fail(`GET /api/wallet/balance  →  ${r.status}`, r.data); }
  }

  // ── 10. WALLET — DEPOSIT ─────────────────────────────────────────────────
  section('10 · WALLET — DEPOSIT');
  {
    const r = await api('POST', '/api/wallet/deposit/create',
      { amount: 250, currency: 'USD', pay_currency: 'ETH' });
    if (r.status === 201 && r.data.pay_address) {
      ok(`POST /api/wallet/deposit/create  →  201`, `(${r.ms}ms)`);
      ok(`pay_address : ${r.data.pay_address}`);
      ok(`pay_amount  : ${r.data.pay_amount} ETH`);
      ok(`order_id    : ${r.data.order_id}`);
    } else { fail(`POST /api/wallet/deposit/create  →  ${r.status}`, r.data); }

    const r2 = await api('POST', '/api/wallet/deposit/create', { amount: 5, pay_currency: 'BTC' });
    r2.status === 400
      ? ok('Amount below $10 minimum  →  400')
      : fail(`Below minimum should be 400, got ${r2.status}`);

    const r3 = await api('POST', '/api/wallet/deposit/create', { amount: -50, pay_currency: 'BTC' });
    r3.status === 400
      ? ok('Negative amount  →  400')
      : fail(`Negative amount should be 400, got ${r3.status}`);
  }

  // ── 11. WALLET — WITHDRAW ────────────────────────────────────────────────
  section('11 · WALLET — WITHDRAW');
  {
    const r = await api('POST', '/api/wallet/withdraw',
      { amount: 100, address: '0xDeadBeef1234567890abcdef', currency: 'USD' });
    r.status === 400 && r.data.error?.toLowerCase().includes('insufficient')
      ? ok('Withdraw with $0 balance  →  400 Insufficient balance', `(${r.ms}ms)`)
      : fail(`Should be 400 insufficient, got ${r.status}`, r.data);

    const r2 = await api('POST', '/api/wallet/withdraw', { amount: 50 });
    r2.status === 400
      ? ok('Missing address  →  400')
      : fail(`Missing address should be 400, got ${r2.status}`);
  }

  // ── 12. WALLET — TRANSFER ────────────────────────────────────────────────
  section('12 · WALLET — TRANSFER');
  {
    const r = await api('POST', '/api/wallet/transfer', { recipient_email: EMAIL, amount: 10 });
    r.status === 400
      ? ok('Self-transfer blocked  →  400', `(${r.ms}ms)`)
      : fail(`Self-transfer should be 400, got ${r.status}`, r.data);

    const r2 = await api('POST', '/api/wallet/transfer',
      { recipient_email: 'nobody@nowhere.invalid', amount: 10 });
    r2.status === 400 || r2.status === 404
      ? ok(`Unknown recipient  →  ${r2.status}`)
      : fail(`Unknown recipient should be 400/404, got ${r2.status}`, r2.data);

    const r3 = await api('POST', '/api/wallet/transfer', { recipient_email: EMAIL });
    r3.status === 400
      ? ok('Missing amount  →  400')
      : fail(`Missing amount should be 400, got ${r3.status}`);
  }

  // ── 13. TRANSACTIONS ─────────────────────────────────────────────────────
  section('13 · TRANSACTIONS');
  {
    const r = await api('GET', '/api/transactions');
    if (r.status === 200 && Array.isArray(r.data.items)) {
      ok(`GET /api/transactions  →  200`, `(${r.ms}ms)`);
      ok(`total: ${r.data.total}  page: ${r.data.page}  page_size: ${r.data.page_size}  has_next: ${r.data.has_next}`);
      r.data.items.forEach(t => ok(`  [${t.type}] $${t.amount} ${t.currency}  — ${t.status}`));
    } else { fail(`GET /api/transactions  →  ${r.status}`, r.data); }

    const r2 = await api('GET', '/api/transactions?page=1&limit=2');
    r2.status === 200 && r2.data.page_size === 2
      ? ok('Custom page_size=2 works')
      : fail(`Custom limit → ${r2.status}`, r2.data);
  }

  // ── 14. NOTIFICATIONS ────────────────────────────────────────────────────
  section('14 · NOTIFICATIONS');
  {
    const r = await api('GET', '/api/notifications');
    if (r.status === 200 && Array.isArray(r.data.data)) {
      ok(`GET /api/notifications  →  200`, `(${r.ms}ms  ${r.data.data.length} items, ${r.data.unread} unread)`);
    } else { fail(`GET /api/notifications  →  ${r.status}`, r.data); }

    const r2 = await api('PUT', '/api/notifications/read-all');
    r2.status === 200
      ? ok('PUT /api/notifications/read-all  →  200')
      : fail(`→ ${r2.status}`, r2.data);

    const r3 = await api('PUT', '/api/notifications/00000000-0000-0000-0000-000000000000/read');
    r3.status === 200
      ? ok('PUT /api/notifications/:id/read (no-op)  →  200')
      : fail(`→ ${r3.status}`, r3.data);
  }

  // ── 15. ORDERS ───────────────────────────────────────────────────────────
  section('15 · ORDERS');
  {
    // Market buy
    const r = await api('POST', '/api/orders',
      { symbol: 'BTC', side: 'buy', type: 'market', amount: 0.001, price: 45000 });
    if (r.status === 201 && r.data.data?.id) {
      const mktId = r.data.data.id;
      ok(`POST /api/orders market buy  →  201`, `(${r.ms}ms  status:${r.data.data.status})`);

      // Filled order can't be cancelled
      const rc = await api('DELETE', `/api/orders/${mktId}`);
      rc.status === 400
        ? ok('Cancel filled order  →  400')
        : fail(`Cancel filled should be 400, got ${rc.status}`);
    } else { fail(`POST /api/orders market  →  ${r.status}`, r.data); }

    // Limit sell
    const r2 = await api('POST', '/api/orders',
      { symbol: 'ETH', side: 'sell', type: 'limit', amount: 0.5, price: 3200 });
    if (r2.status === 201 && r2.data.data?.id) {
      limitOrderId = r2.data.data.id;
      ok(`POST /api/orders limit sell  →  201`, `(id:${limitOrderId.slice(0,8)}…  status:${r2.data.data.status})`);

      const rd = await api('DELETE', `/api/orders/${limitOrderId}`);
      rd.status === 200 && rd.data.data?.status === 'cancelled'
        ? ok('Cancel pending order  →  200  status:cancelled')
        : fail(`Cancel pending → ${rd.status}`, rd.data);
    } else { fail(`POST /api/orders limit  →  ${r2.status}`, r2.data); }

    // Validation: invalid side
    const r3 = await api('POST', '/api/orders',
      { symbol: 'BTC', side: 'hold', type: 'market', amount: 1 });
    r3.status === 400 ? ok('Invalid side  →  400') : fail(`→ ${r3.status}`);

    // Validation: limit order without price
    const r4 = await api('POST', '/api/orders',
      { symbol: 'BTC', side: 'buy', type: 'limit', amount: 1 });
    r4.status === 400 ? ok('Limit order missing price  →  400') : fail(`→ ${r4.status}`);

    // List orders
    const r5 = await api('GET', '/api/orders');
    r5.status === 200 && Array.isArray(r5.data.data)
      ? ok(`GET /api/orders  →  200`, `(${r5.data.total} orders)`)
      : fail(`→ ${r5.status}`, r5.data);

    // Cancel non-existent
    const r6 = await api('DELETE', '/api/orders/00000000-0000-0000-0000-000000000000');
    r6.status === 404 ? ok('Cancel non-existent order  →  404') : fail(`→ ${r6.status}`);
  }

  // ── 16. PRICE ALERTS ─────────────────────────────────────────────────────
  section('16 · PRICE ALERTS');
  {
    const r = await api('POST', '/api/alerts',
      { symbol: 'BTC', condition: 'above', target_price: 100000 });
    if (r.status === 201 && r.data.data?.id) {
      alertId = r.data.data.id;
      ok(`POST /api/alerts  →  201`, `(${r.ms}ms)`);
      ok(`symbol:${r.data.data.symbol}  condition:${r.data.data.condition}  price:$${r.data.data.target_price}`);
    } else { fail(`POST /api/alerts  →  ${r.status}`, r.data); }

    const r2 = await api('POST', '/api/alerts',
      { symbol: 'ETH', condition: 'below', target_price: 1000 });
    r2.status === 201 ? ok('Create ETH below alert  →  201') : fail(`→ ${r2.status}`, r2.data);

    const r3 = await api('GET', '/api/alerts');
    r3.status === 200 && Array.isArray(r3.data.data)
      ? ok(`GET /api/alerts  →  200`, `(${r3.data.total} alerts)`)
      : fail(`→ ${r3.status}`, r3.data);

    // Validation
    const r4 = await api('POST', '/api/alerts', { symbol: 'BTC', condition: 'sideways', target_price: 50000 });
    r4.status === 400 ? ok('Invalid condition  →  400') : fail(`→ ${r4.status}`);

    const r5 = await api('POST', '/api/alerts', { symbol: 'BTC', condition: 'above', target_price: -1 });
    r5.status === 400 ? ok('Negative price  →  400') : fail(`→ ${r5.status}`);

    const r6 = await api('POST', '/api/alerts', { condition: 'above', target_price: 50000 });
    r6.status === 400 ? ok('Missing symbol  →  400') : fail(`→ ${r6.status}`);

    // Delete
    if (alertId) {
      const r7 = await api('DELETE', `/api/alerts/${alertId}`);
      r7.status === 200
        ? ok(`DELETE /api/alerts/:id  →  200`)
        : fail(`→ ${r7.status}`, r7.data);
    }
  }

  // ── 17. RATE LIMITER ─────────────────────────────────────────────────────
  section('17 · RATE LIMITING');
  {
    console.log(dim('  Firing 12 rapid requests to /api/auth/login…'));
    let got429 = false;
    for (let i = 0; i < 12; i++) {
      const r = await api('POST', '/api/auth/login',
        { email: `rl_${i}@test.io`, password: 'x' }, false);
      if (r.status === 429) { got429 = true; ok(`Rate limiter fired at attempt ${i + 1}  →  429`); break; }
    }
    if (!got429) warn('429 not triggered in 12 attempts (limiter resets per 15-min window — OK if fresh server)');
  }

  // ── 18. LOGOUT ───────────────────────────────────────────────────────────
  section('18 · AUTH — LOGOUT');
  {
    const r = await api('POST', '/api/auth/logout');
    r.status === 200
      ? ok(`POST /api/auth/logout  →  200`, `(${r.ms}ms)`)
      : fail(`→ ${r.status}`, r.data);
  }

  summarise();
}

function summarise() {
  const total = passed + failed;
  console.log(`\n${'═'.repeat(54)}`);
  console.log(bold(`  Results: ${green(passed + ' passed')}  ${failed > 0 ? red(failed + ' failed') : '0 failed'}  /  ${total} total`));
  console.log(`${'═'.repeat(54)}\n`);
  if (failed > 0) process.exit(1);
}

run().catch(err => { console.error(red('\nFatal error:'), err.message); process.exit(1); });
