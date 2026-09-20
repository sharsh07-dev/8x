/**
 * Automated Verification Suite for Step 10: Razorpay Payment Integration & Verification
 */

import { prisma } from '../src/lib/prisma';
import { 
  createRazorpayOrder, 
  verifyRazorpaySignature, 
  generateTestSignature,
  verifyRazorpayWebhookSignature 
} from '../src/lib/payments/razorpay';

async function runRazorpayTests() {
  console.log('====================================================');
  console.log('Starting Step 10 Razorpay Payment Verification Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  try {
    // 1. Test Order Creation
    const orderParams = {
      amount: 19999, // $199.99 in cents
      currency: 'USD',
      receipt: `RCPT-${Date.now()}`,
      notes: { channel: 'test_suite' },
    };

    const rzpOrder = await createRazorpayOrder(orderParams);
    if (rzpOrder && rzpOrder.id && rzpOrder.amount === 19999 && rzpOrder.currency === 'USD') {
      console.log(`✅ [PASS] createRazorpayOrder succeeded: ID=${rzpOrder.id}, Amount=${rzpOrder.amount}`);
      passed++;
    } else {
      console.error('❌ [FAIL] createRazorpayOrder returned invalid structure:', rzpOrder);
      failed++;
    }

    // 2. Test Signature Verification with Valid Signature
    const testOrderId = rzpOrder.id;
    const testPaymentId = `pay_${Date.now()}`;
    const validSignature = generateTestSignature(testOrderId, testPaymentId);

    const isSigValid = verifyRazorpaySignature({
      orderId: testOrderId,
      paymentId: testPaymentId,
      signature: validSignature,
    });

    if (isSigValid) {
      console.log('✅ [PASS] verifyRazorpaySignature successfully validated valid signature');
      passed++;
    } else {
      console.error('❌ [FAIL] verifyRazorpaySignature rejected a valid signature');
      failed++;
    }

    // 3. Test Signature Verification with Tampered Signature (Must Fail)
    const isTamperedSigValid = verifyRazorpaySignature({
      orderId: testOrderId,
      paymentId: testPaymentId,
      signature: 'invalid_tampered_signature_xyz_123',
    });

    if (!isTamperedSigValid) {
      console.log('✅ [PASS] verifyRazorpaySignature correctly rejected forged/tampered signature');
      passed++;
    } else {
      console.error('❌ [FAIL] verifyRazorpaySignature accepted forged signature!');
      failed++;
    }

    // 4. Test Webhook Signature Verification
    const webhookSecret = 'test_webhook_secret_9988';
    const samplePayload = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { id: testPaymentId, amount: 19999 } } },
    });

    const crypto = require('crypto');
    const validWebhookSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(samplePayload)
      .digest('hex');

    const isWebhookValid = verifyRazorpayWebhookSignature(samplePayload, validWebhookSig, webhookSecret);
    const isForgedWebhookValid = verifyRazorpayWebhookSignature(samplePayload, 'forged_sig', webhookSecret);

    if (isWebhookValid && !isForgedWebhookValid) {
      console.log('✅ [PASS] Webhook signature verification passed for genuine event and rejected forged event');
      passed++;
    } else {
      console.error('❌ [FAIL] Webhook signature verification error');
      failed++;
    }

    // 5. Database Order & Payment Model Persistence with 'RAZORPAY' Provider
    const testUser = await prisma.user.create({
      data: {
        name: 'Razorpay Test Customer',
        email: `rzp_customer_${Date.now()}@example.com`,
        emailVerified: true,
      },
    });

    const testOrder = await prisma.order.create({
      data: {
        orderNumber: `APX-RZP-${Date.now()}`,
        userId: testUser.id,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        subtotal: 199.99,
        total: 199.99,
        estimatedDelivery: 'Tomorrow',
        payment: {
          create: {
            provider: 'RAZORPAY',
            providerReference: testPaymentId,
            amount: 199.99,
            currency: 'USD',
            status: 'PAID',
          },
        },
      },
      include: {
        payment: true,
      },
    });

    if (testOrder.payment && testOrder.payment.provider === 'RAZORPAY' && testOrder.payment.status === 'PAID') {
      console.log(`✅ [PASS] Order and Payment record persisted with provider=RAZORPAY: ${testOrder.payment.providerReference}`);
      passed++;
    } else {
      console.error('❌ [FAIL] Payment record persistence failed:', testOrder.payment);
      failed++;
    }

    // Cleanup test data
    await prisma.payment.deleteMany({ where: { orderId: testOrder.id } });
    await prisma.order.delete({ where: { id: testOrder.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ [PASS] Cleaned up temporary test payment records');
    passed++;

  } catch (err: any) {
    console.error('Unexpected Razorpay test error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runRazorpayTests().catch((err) => {
  console.error('Fatal error running Razorpay tests:', err);
  process.exit(1);
});
