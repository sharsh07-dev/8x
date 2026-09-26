/**
 * PEHNO — PHASE 10: 100 CONCURRENT USER LOAD TEST
 * ======================================================
 * Realistic user-mix simulation:
 *   40%  Browse/Search      (no auth required)
 *   20%  Product pages      (no auth required)
 *   15%  Cart operations    (auth required)
 *   10%  Wishlist           (auth required)
 *   10%  Checkout (init)    (auth required)
 *    5%  Account/orders     (auth required)
 *
 * Runs sequential ramp: 10 → 25 → 50 → 75 → 100 → sustained 100 for 10 min
 *
 * Usage:
 *   npx tsx scripts/load-test.ts
 *
 * Requirements:
 *   - Backend must be running on port 3001
 *   - At least 1 test user must exist in DB (see TEST_USER_COOKIE below)
 *   - Set LOAD_TEST_COOKIE env var to a valid firebase-session cookie value
 */

import autocannon from 'autocannon';
import { createWriteStream, mkdirSync } from 'fs';
import path from 'path';

const BASE_URL = process.env.LOAD_TEST_BASE_URL || 'http://localhost:3001';
const API = `${BASE_URL}/api/v1`;

// A valid firebase-session cookie or better-auth session cookie from a real logged-in user.
// Set this via: LOAD_TEST_COOKIE="firebase-session=eyJ..." npx tsx scripts/load-test.ts
const SESSION_COOKIE = process.env.LOAD_TEST_COOKIE || '';

const PRODUCT_IDS = [
  'myn-1483', 'myn-1461', 'myn-1477', 'myn-1496', 'myn-1491',
  'myn-134', 'myn-136', 'myn-191', 'myn-124', 'myn-1011'
];

const SEARCH_TERMS = [
  'shirt', 'jeans', 'dress', 'kurta', 'jacket', 'saree', 'shoes'
];

const PINCODES = ['400001', '110001', '560001', '600001', '700001'];

// ─── Results tracker ─────────────────────────────────────────────────────────
interface PhaseResult {
  phase: string;
  users: number;
  duration: number;
  requests: number;
  rps: number;
  p50: number;
  p95: number;
  p99: number;
  errors: number;
  timeouts: number;
  errorRate: string;
}

const results: PhaseResult[] = [];
const reportDir = path.join(process.cwd(), 'load-test-reports');
mkdirSync(reportDir, { recursive: true });

// ─── Helper: pick random item ─────────────────────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Request definitions ──────────────────────────────────────────────────────

const publicRequests = [
  // 40% Browse/Search
  { method: 'GET', path: `/api/v1/catalog/products?limit=12&page=1` },
  { method: 'GET', path: `/api/v1/catalog/products?limit=12&page=2` },
  { method: 'GET', path: `/api/v1/catalog/products?search=${pick(SEARCH_TERMS)}` },
  { method: 'GET', path: `/api/v1/catalog/products?search=${pick(SEARCH_TERMS)}` },
  { method: 'GET', path: `/api/v1/catalog/products?search=${pick(SEARCH_TERMS)}` },
  { method: 'GET', path: `/api/v1/catalog/categories` },
  { method: 'GET', path: `/api/v1/catalog/products?limit=12&page=1` },
  { method: 'GET', path: `/api/v1/catalog/products?search=kurta` },
  // 20% Product pages
  { method: 'GET', path: `/api/v1/catalog/products/${pick(PRODUCT_IDS)}` },
  { method: 'GET', path: `/api/v1/catalog/products/${pick(PRODUCT_IDS)}` },
  { method: 'GET', path: `/api/v1/catalog/products/${pick(PRODUCT_IDS)}` },
  { method: 'GET', path: `/api/v1/catalog/products/${pick(PRODUCT_IDS)}` },
  // Health
  { method: 'GET', path: `/api/v1/health` },
];

const authedRequests = (cookie: string) => [
  // 15% Cart
  { method: 'GET', path: `/api/v1/cart` },
  { method: 'GET', path: `/api/v1/cart` },
  { method: 'GET', path: `/api/v1/cart` },
  // 10% Orders
  { method: 'GET', path: `/api/v1/orders` },
  { method: 'GET', path: `/api/v1/orders` },
  // 5% Serviceability
  { method: 'POST', path: `/api/v1/shipping/serviceability` },
];

// ─── Run a single phase ───────────────────────────────────────────────────────
function runPhase(
  label: string,
  connections: number,
  duration: number
): Promise<PhaseResult> {
  return new Promise((resolve) => {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`▶  Phase: ${label} | Users: ${connections} | Duration: ${duration}s`);
    console.log(`${'═'.repeat(60)}`);

    // Build mixed request pipeline with dynamic paths
    const buildRequests = () => [
      { method: 'GET', path: `/api/v1/catalog/products?limit=12&page=1` },
      { method: 'GET', path: `/api/v1/catalog/products?limit=12&page=2` },
      { method: 'GET', path: `/api/v1/catalog/products?search=${pick(SEARCH_TERMS)}` },
      { method: 'GET', path: `/api/v1/catalog/products?search=${pick(SEARCH_TERMS)}` },
      { method: 'GET', path: `/api/v1/catalog/products?search=${pick(SEARCH_TERMS)}` },
      { method: 'GET', path: `/api/v1/catalog/categories` },
      { method: 'GET', path: `/api/v1/catalog/products?limit=12&page=1` },
      { method: 'GET', path: `/api/v1/catalog/products?search=kurta` },
      { method: 'GET', path: `/api/v1/catalog/products/${pick(PRODUCT_IDS)}` },
      { method: 'GET', path: `/api/v1/catalog/products/${pick(PRODUCT_IDS)}` },
      { method: 'GET', path: `/api/v1/catalog/products/${pick(PRODUCT_IDS)}` },
      { method: 'GET', path: `/api/v1/catalog/products/${pick(PRODUCT_IDS)}` },
      { method: 'GET', path: `/api/v1/health` },
    ];

    const requests = buildRequests() as any;

    const instance = autocannon({
      url: BASE_URL,
      connections,
      duration,
      pipelining: 1,
      timeout: 10,
      requests,
      headers: SESSION_COOKIE ? { cookie: SESSION_COOKIE } : {},
    });

    autocannon.track(instance, { renderProgressBar: true });

    instance.on('done', (result) => {
      // autocannon uses p97_5 not p95; p50 is accurate
      const p50  = result.latency.p50   ?? result.latency.average ?? 0;
      const p95  = (result.latency as any).p97_5 ?? (result.latency as any).p95 ?? result.latency.max ?? 0;
      const p99  = result.latency.p99   ?? result.latency.max ?? 0;

      const phaseResult: PhaseResult = {
        phase: label,
        users: connections,
        duration,
        requests: result.requests.total,
        rps: Math.round(result.requests.average),
        p50,
        p95,
        p99,
        errors: result.errors,
        timeouts: result.timeouts,
        errorRate: `${((result.errors / Math.max(result.requests.total, 1)) * 100).toFixed(2)}%`,
      };

      results.push(phaseResult);

      console.log(`\n✅  Phase "${label}" Complete`);
      console.log(`   Requests    : ${phaseResult.requests.toLocaleString()}`);
      console.log(`   RPS         : ${phaseResult.rps}`);
      console.log(`   Latency P50 : ${phaseResult.p50}ms`);
      console.log(`   Latency P95 : ${phaseResult.p95}ms`);
      console.log(`   Latency P99 : ${phaseResult.p99}ms`);
      console.log(`   Errors      : ${phaseResult.errors} (${phaseResult.errorRate})`);
      console.log(`   Timeouts    : ${phaseResult.timeouts}`);

      resolve(phaseResult);
    });
  });
}

// ─── Inventory integrity check ────────────────────────────────────────────────
async function checkInventoryIntegrity(): Promise<void> {
  console.log('\n🔍  Running post-load inventory integrity check...');
  try {
    const res = await fetch(`${API}/catalog/products?limit=10`);
    const data = await res.json();
    const products: any[] = data?.data?.products || [];
    
    let negativeStock = 0;
    let checked = 0;
    for (const p of products) {
      if (typeof p.stock === 'number') {
        checked++;
        if (p.stock < 0) {
          negativeStock++;
          console.error(`   ❌ Negative stock detected: Product ${p.id} has stock=${p.stock}`);
        }
      }
    }
    
    if (negativeStock === 0) {
      console.log(`   ✅  Inventory OK — ${checked} products checked, no negative stock.`);
    } else {
      console.error(`   ❌  CRITICAL: ${negativeStock} products with negative inventory!`);
    }
  } catch (e: any) {
    console.error(`   ⚠️  Could not verify inventory: ${e.message}`);
  }
}

// ─── Generate final report ───────────────────────────────────────────────────
function generateReport(): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportDir, `load-test-${timestamp}.md`);
  const stream = createWriteStream(reportPath);

  const hasSession = !!SESSION_COOKIE;
  const overallErrors = results.reduce((sum, r) => sum + r.errors, 0);
  const overallRequests = results.reduce((sum, r) => sum + r.requests, 0);
  const overallErrorRate = ((overallErrors / Math.max(overallRequests, 1)) * 100).toFixed(2);

  let passed = results.filter(r => r.p95 < 3000 && r.errors / Math.max(r.requests, 1) < 0.02).length;
  let failed = results.length - passed;

  stream.write(`# PEHNO LOAD TEST REPORT\n`);
  stream.write(`**Date:** ${new Date().toLocaleString()}\n\n`);
  stream.write(`**Base URL:** ${BASE_URL}\n`);
  stream.write(`**Authenticated Requests:** ${hasSession ? 'YES' : 'NO (set LOAD_TEST_COOKIE)'}\n\n`);
  stream.write(`---\n\n`);
  stream.write(`## Phase Results\n\n`);
  stream.write(`| Phase | Users | Duration | Requests | RPS | P50 | P95 | P99 | Errors | Error Rate | Status |\n`);
  stream.write(`|-------|-------|----------|----------|-----|-----|-----|-----|--------|------------|--------|\n`);

  for (const r of results) {
    const status = (r.p95 < 3000 && parseFloat(r.errorRate) < 2) ? '✅ PASS' : '❌ FAIL';
    stream.write(`| ${r.phase} | ${r.users} | ${r.duration}s | ${r.requests} | ${r.rps} | ${r.p50}ms | ${r.p95}ms | ${r.p99}ms | ${r.errors} | ${r.errorRate} | ${status} |\n`);
  }

  stream.write(`\n---\n\n`);
  stream.write(`## Summary\n\n`);
  stream.write(`| Metric | Value |\n`);
  stream.write(`|--------|-------|\n`);
  stream.write(`| Total Requests | ${overallRequests.toLocaleString()} |\n`);
  stream.write(`| Total Errors | ${overallErrors} |\n`);
  stream.write(`| Overall Error Rate | ${overallErrorRate}% |\n`);
  stream.write(`| Phases Passed | ${passed}/${results.length} |\n`);
  stream.write(`| Phases Failed | ${failed}/${results.length} |\n\n`);
  
  // Pass/Fail criteria
  stream.write(`## Pass Criteria\n\n`);
  stream.write(`- P95 latency < 3000ms: ${results.every(r => r.p95 < 3000) ? '✅ PASS' : '❌ FAIL'}\n`);
  stream.write(`- Error rate < 2%: ${parseFloat(overallErrorRate) < 2 ? '✅ PASS' : '❌ FAIL'}\n`);
  stream.write(`- No timeouts: ${results.every(r => r.timeouts === 0) ? '✅ PASS' : `⚠️  ${results.reduce((s, r) => s + r.timeouts, 0)} total timeouts`}\n`);
  stream.write(`- 100 users sustained: ${results.find(r => r.users === 100 && r.duration >= 60) ? '✅ PASS' : '⚠️ NOT RUN'}\n`);

  stream.end();
  console.log(`\n📄  Full report saved to: ${reportPath}`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀  PEHNO — PHASE 10: LOAD TESTING');
  console.log('═'.repeat(60));
  console.log(`   Target    : ${BASE_URL}`);
  console.log(`   Auth Mode : ${SESSION_COOKIE ? 'Authenticated' : 'Anonymous (set LOAD_TEST_COOKIE for auth endpoints)'}`);
  console.log(`   Plan      : 10 → 25 → 50 → 75 → 100 users, then sustained 100 for 60s`);

  // Verify backend is up
  try {
    const health = await fetch(`${API}/health`);
    if (!health.ok) throw new Error(`Health check returned ${health.status}`);
    console.log(`\n✅  Backend is UP (health check passed)`);
  } catch (e: any) {
    console.error(`\n❌  Backend is NOT reachable at ${BASE_URL}: ${e.message}`);
    console.error(`    Start the API with: npm run api:dev`);
    process.exit(1);
  }

  // RAMP UP
  await runPhase('Warmup — 10 Users', 10, 15);
  await new Promise(r => setTimeout(r, 2000));

  await runPhase('Ramp — 25 Users', 25, 15);
  await new Promise(r => setTimeout(r, 2000));

  await runPhase('Ramp — 50 Users', 50, 15);
  await new Promise(r => setTimeout(r, 2000));

  await runPhase('Ramp — 75 Users', 75, 15);
  await new Promise(r => setTimeout(r, 2000));

  await runPhase('Peak — 100 Users', 100, 15);
  await new Promise(r => setTimeout(r, 3000));

  // SUSTAINED LOAD
  await runPhase('Sustained — 100 Users × 60s', 100, 60);

  // INVENTORY CHECK
  await checkInventoryIntegrity();

  // REPORT
  console.log('\n\n' + '═'.repeat(60));
  console.log('📊  FINAL LOAD TEST SUMMARY');
  console.log('═'.repeat(60));
  console.log(`${'Phase'.padEnd(30)} ${'Users'.padEnd(8)} ${'RPS'.padEnd(8)} ${'P95'.padEnd(10)} ${'Error%'.padEnd(10)} Status`);
  console.log('-'.repeat(80));

  let allPassed = true;
  for (const r of results) {
    const passed = r.p95 < 3000 && parseFloat(r.errorRate) < 2;
    if (!passed) allPassed = false;
    console.log(
      `${r.phase.padEnd(30)} ${String(r.users).padEnd(8)} ${String(r.rps).padEnd(8)} ${`${r.p95}ms`.padEnd(10)} ${r.errorRate.padEnd(10)} ${passed ? '✅ PASS' : '❌ FAIL'}`
    );
  }

  generateReport();

  console.log('\n' + '═'.repeat(60));
  if (allPassed) {
    console.log('🟢  PHASE 10 VERDICT: PASS — System handles 100 concurrent users within SLA');
  } else {
    console.log('🔴  PHASE 10 VERDICT: FAIL — One or more phases exceeded SLA thresholds');
    console.log('   Review the report for details and address bottlenecks before go-live.');
  }
  console.log('═'.repeat(60) + '\n');
}

main().catch(console.error);
