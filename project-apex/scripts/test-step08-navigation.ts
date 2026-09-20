/**
 * Automated test verification suite for Step 08:
 * Department navigation, category routes, today's deals, search, and collections.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface RouteCheck {
  path: string;
  name: string;
  expectedStatus: number;
}

const routesToTest: RouteCheck[] = [
  { path: '/', name: 'Homepage', expectedStatus: 200 },
  { path: '/departments', name: 'Departments Directory', expectedStatus: 200 },
  { path: '/todays-deals', name: "Today's Deals", expectedStatus: 200 },
  { path: '/electronics', name: 'Electronics Department', expectedStatus: 200 },
  { path: '/electronics/audio', name: 'Electronics Subcategory: Audio', expectedStatus: 200 },
  { path: '/electronics/mobiles', name: 'Electronics Subcategory: Mobiles', expectedStatus: 200 },
  { path: '/clothing', name: 'Clothing Department', expectedStatus: 200 },
  { path: '/clothing/men', name: 'Clothing Subcategory: Men', expectedStatus: 200 },
  { path: '/clothing/women', name: 'Clothing Subcategory: Women', expectedStatus: 200 },
  { path: '/clothing/kids', name: 'Clothing Subcategory: Kids', expectedStatus: 200 },
  { path: '/clothing/footwear', name: 'Clothing Subcategory: Footwear', expectedStatus: 200 },
  { path: '/clothing/accessories', name: 'Clothing Subcategory: Accessories', expectedStatus: 200 },
  { path: '/home-kitchen', name: 'Home & Kitchen Department', expectedStatus: 200 },
  { path: '/home-kitchen/kitchen', name: 'Home & Kitchen Subcategory: Kitchen', expectedStatus: 200 },
  { path: '/beauty', name: 'Beauty & Personal Care', expectedStatus: 200 },
  { path: '/beauty/skincare', name: 'Beauty Subcategory: Skincare', expectedStatus: 200 },
  { path: '/books', name: 'Books Department', expectedStatus: 200 },
  { path: '/books/nonfiction', name: 'Books Subcategory: Non-fiction', expectedStatus: 200 },
  { path: '/sports', name: 'Sports & Outdoors', expectedStatus: 200 },
  { path: '/sports/workout', name: 'Sports Subcategory: Workout', expectedStatus: 200 },
  { path: '/collections/bestsellers-tech', name: 'Collection: Tech Bestsellers', expectedStatus: 200 },
  { path: '/collections/modern-wardrobe', name: 'Collection: Modern Wardrobe', expectedStatus: 200 },
  { path: '/collections/work-from-home', name: 'Collection: Work From Home', expectedStatus: 200 },
  { path: '/collections/wellness-routine', name: 'Collection: Wellness Routine', expectedStatus: 200 },
  { path: '/search?q=wireless', name: 'Search: Query "wireless"', expectedStatus: 200 },
  { path: '/search?category=Electronics', name: 'Search: Category "Electronics"', expectedStatus: 200 },
];

async function runNavigationTests() {
  console.log('====================================================');
  console.log('Starting Step 08 Navigation Verification Suite');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  for (const route of routesToTest) {
    const url = `${BASE_URL}${route.path}`;
    try {
      const startTime = Date.now();
      const res = await fetch(url, { method: 'GET' });
      const elapsed = Date.now() - startTime;

      if (res.status === route.expectedStatus) {
        console.log(`✅ [PASS] ${route.name.padEnd(38)} (${route.path}) -> ${res.status} [${elapsed}ms]`);
        passed++;
      } else {
        console.error(`❌ [FAIL] ${route.name.padEnd(38)} (${route.path}) -> Expected ${route.expectedStatus}, got ${res.status}`);
        failed++;
      }
    } catch (err: any) {
      console.error(`❌ [ERROR] ${route.name} (${route.path}): ${err.message}`);
      failed++;
    }
  }

  console.log('\n====================================================');
  console.log(`Results: ${passed} passed, ${failed} failed, ${routesToTest.length} total.`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runNavigationTests().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
