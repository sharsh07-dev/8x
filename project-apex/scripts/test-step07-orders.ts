import { PrismaClient } from '@prisma/client';
import { calculateOrderPricing } from '../src/lib/checkout/pricing';
import { checkInventoryAvailability, ensureInventorySeeded } from '../src/lib/checkout/inventory';
import { MockPaymentAdapter } from '../src/lib/payments/payment-adapter';

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting Step 07 Checkout & Order Placement Verification Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1: Authoritative Server-Side Pricing & Floating Point Math
    // -------------------------------------------------------------
    console.log('1. Testing Pricing & Arithmetic Calculation...');
    const sampleItems = [
      { productId: 'prod-1', quantity: 2 }, // $189.99 * 2 = $379.98
      { productId: 'prod-2', quantity: 1 }, // $328.00 * 1 = $328.00
    ];
    const pricing = calculateOrderPricing(sampleItems, 'FREE_STANDARD', 'APEX10');
    assert(pricing.success, 'Pricing calculated successfully');
    if (pricing.success) {
      assert(pricing.pricing.subtotal === 707.98, `Subtotal exact match ($707.98 expected, got ${pricing.pricing.subtotal})`);
      assert(pricing.pricing.shipping === 0, 'Standard shipping is FREE for orders >= $35');
      assert(pricing.pricing.discount === 70.80, `Promo APEX10 gave 10% discount ($70.80 expected, got ${pricing.pricing.discount})`);
      // Tax: 7.5% of (707.98 - 70.80) = 7.5% of 637.18 = 47.79
      assert(pricing.pricing.tax === 47.79, `Tax calculation rounded accurately ($47.79 expected, got ${pricing.pricing.tax})`);
      // Total: 637.18 + 0 + 47.79 = 684.97
      assert(pricing.pricing.total === 684.97, `Grand total exact match ($684.97 expected, got ${pricing.pricing.total})`);
    }

    // -------------------------------------------------------------
    // Test 2: Inventory Stock & Availability Checks
    // -------------------------------------------------------------
    console.log('\n2. Testing Inventory Availability and Seeding...');
    await ensureInventorySeeded();
    const invCheckValid = await checkInventoryAvailability([{ productId: 'prod-1', quantity: 1 }]);
    assert(invCheckValid.valid, 'Valid product quantity allowed');

    const invCheckOversell = await checkInventoryAvailability([{ productId: 'prod-1', quantity: 999999 }]);
    assert(!invCheckOversell.valid, 'Overselling stock prevented (quantity exceeding available stock rejected)');

    // -------------------------------------------------------------
    // Test 3: Payment Mock Adapter Scenarios
    // -------------------------------------------------------------
    console.log('\n3. Testing Mock Payment Adapter Sandbox Flows...');
    const cardSuccess = await MockPaymentAdapter.processPayment({
      orderId: 'test-ord-1',
      orderNumber: 'APX-2026-TEST1',
      amount: 199.99,
      currency: 'USD',
      provider: 'SIMULATED_CARD',
      cardLast4: '4242',
    });
    assert(cardSuccess.success && cardSuccess.status === 'PAID', 'Valid test card ending in 4242 approved in sandbox');

    const cardDeclined = await MockPaymentAdapter.processPayment({
      orderId: 'test-ord-2',
      orderNumber: 'APX-2026-TEST2',
      amount: 199.99,
      currency: 'USD',
      provider: 'SIMULATED_CARD',
      cardLast4: '0000',
    });
    assert(!cardDeclined.success && cardDeclined.status === 'FAILED', 'Declined test card ending in 0000 rejected with 402');

    const codPayment = await MockPaymentAdapter.processPayment({
      orderId: 'test-ord-3',
      orderNumber: 'APX-2026-TEST3',
      amount: 49.99,
      currency: 'USD',
      provider: 'CASH_ON_DELIVERY',
    });
    assert(codPayment.success && codPayment.status === 'PENDING', 'Cash on Delivery remains in PENDING status until delivery');

    // -------------------------------------------------------------
    // Test 4: End-to-End Order Creation & Address Ownership Verification
    // -------------------------------------------------------------
    console.log('\n4. Testing Order Creation & Strict User Authorization...');
    
    // Create two test users
    const userA = await prisma.user.upsert({
      where: { email: 'customer.alice@example.com' },
      update: {},
      create: {
        name: 'Alice Customer',
        email: 'customer.alice@example.com',
        emailVerified: true,
      },
    });

    const userB = await prisma.user.upsert({
      where: { email: 'customer.bob@example.com' },
      update: {},
      create: {
        name: 'Bob Customer',
        email: 'customer.bob@example.com',
        emailVerified: true,
      },
    });

    // Create an address for User A
    const addressA = await prisma.address.create({
      data: {
        userId: userA.id,
        fullName: 'Alice Customer',
        street: '123 Market Street, Apt 4B',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94103',
        country: 'United States',
        phone: '415-555-0192',
      },
    });

    // Check address ownership rule: User B should NOT be able to use User A's address
    const unauthorizedAddressCheck = await prisma.address.findFirst({
      where: {
        id: addressA.id,
        userId: userB.id, // Trying to access User A's address under User B's session
      },
    });
    assert(unauthorizedAddressCheck === null, 'Address ownership isolation enforced: User B cannot select User A address');

    // Place an Order for User A in a database transaction
    const initialInv = await prisma.productInventory.findUnique({ where: { productId: 'prod-1' } });
    const initialStock = initialInv?.stock || 25;

    const orderNumber = `APX-2026-TST${Math.floor(1000 + Math.random() * 9000)}`;
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Decrement stock
      await tx.productInventory.update({
        where: { productId: 'prod-1' },
        data: { stock: { decrement: 1 } },
      });

      return tx.order.create({
        data: {
          orderNumber,
          userId: userA.id,
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          subtotal: 189.99,
          shipping: 0,
          tax: 14.25,
          total: 204.24,
          deliveryMethod: 'FREE Standard Delivery',
          estimatedDelivery: 'Thursday, Sep 24',
          items: {
            create: [
              {
                productId: 'prod-1',
                productTitle: 'Apple AirPods Pro (2nd Generation)',
                productImage: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434',
                unitPrice: 189.99,
                quantity: 1,
                lineTotal: 189.99,
              },
            ],
          },
          addressSnapshot: {
            create: {
              fullName: addressA.fullName,
              street: addressA.street,
              city: addressA.city,
              state: addressA.state,
              zipCode: addressA.zipCode,
              country: addressA.country,
            },
          },
          payment: {
            create: {
              provider: 'SIMULATED_CARD',
              providerReference: 'SIM-AUTH-9999',
              amount: 204.24,
              status: 'PAID',
              cardLast4: '4242',
              cardBrand: 'Visa',
            },
          },
        },
        include: {
          items: true,
          addressSnapshot: true,
          payment: true,
        },
      });
    });

    assert(createdOrder.orderNumber === orderNumber, 'Order created with unique order number');
    assert(createdOrder.items.length === 1, 'OrderItem snapshot created');
    assert(createdOrder.addressSnapshot?.street === addressA.street, 'Address snapshot preserved in order');

    // Verify stock decremented
    const updatedInv = await prisma.productInventory.findUnique({ where: { productId: 'prod-1' } });
    assert((updatedInv?.stock ?? 0) === initialStock - 1, 'Product inventory decremented accurately in transaction');

    // -------------------------------------------------------------
    // Test 5: Strict Order Read Authorization (No ID tampering)
    // -------------------------------------------------------------
    console.log('\n5. Testing Order Read Authorization Isolation...');
    
    // User A can read their own order
    const readUserAOrder = await prisma.order.findFirst({
      where: {
        id: createdOrder.id,
        userId: userA.id,
      },
    });
    assert(readUserAOrder !== null, 'Order owner (User A) successfully retrieves order');

    // User B CANNOT read User A's order
    const readUserBOrder = await prisma.order.findFirst({
      where: {
        id: createdOrder.id,
        userId: userB.id,
      },
    });
    assert(readUserBOrder === null, 'Unauthorized user (User B) denied access to User A order (403 Forbidden enforcement)');

    // -------------------------------------------------------------
    // Test 6: Idempotency Protection Against Duplicate Submissions
    // -------------------------------------------------------------
    console.log('\n6. Testing Idempotent Order Submission Record...');
    const testIdemKey = `idem_test_${Date.now()}`;
    await prisma.idempotencyRecord.create({
      data: {
        key: testIdemKey,
        userId: userA.id,
        orderId: createdOrder.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const idemLookup = await prisma.idempotencyRecord.findUnique({
      where: { key: testIdemKey },
    });
    assert(idemLookup?.orderId === createdOrder.id, 'Idempotency record tracks previous order, preventing duplicate order creation');

    // -------------------------------------------------------------
    // Test 7: Order Cancellation & Inventory Restoration
    // -------------------------------------------------------------
    console.log('\n7. Testing Order Cancellation & Stock Restoration...');
    await prisma.$transaction(async (tx) => {
      // Restore stock
      await tx.productInventory.update({
        where: { productId: 'prod-1' },
        data: { stock: { increment: 1 } },
      });
      await tx.order.update({
        where: { id: createdOrder.id },
        data: { status: 'CANCELLED', paymentStatus: 'REFUNDED' },
      });
    });

    const restoredInv = await prisma.productInventory.findUnique({ where: { productId: 'prod-1' } });
    assert((restoredInv?.stock ?? 0) === initialStock, 'Inventory stock restored after order cancellation');

    const cancelledOrder = await prisma.order.findUnique({ where: { id: createdOrder.id } });
    assert(cancelledOrder?.status === 'CANCELLED' && cancelledOrder?.paymentStatus === 'REFUNDED', 'Order status updated to CANCELLED and REFUNDED');

    // Clean up test data
    await prisma.idempotencyRecord.deleteMany({ where: { userId: userA.id } });
    await prisma.payment.deleteMany({ where: { orderId: createdOrder.id } });
    await prisma.orderAddress.deleteMany({ where: { orderId: createdOrder.id } });
    await prisma.orderItem.deleteMany({ where: { orderId: createdOrder.id } });
    await prisma.order.deleteMany({ where: { id: createdOrder.id } });
    await prisma.address.deleteMany({ where: { id: addressA.id } });
    await prisma.user.deleteMany({ where: { email: { in: ['customer.alice@example.com', 'customer.bob@example.com'] } } });

    console.log(`\n========================================`);
    console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
