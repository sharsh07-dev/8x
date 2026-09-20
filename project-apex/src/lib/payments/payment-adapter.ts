/**
 * Project Apex - Payment Test Adapter
 *
 * Implements a clearly isolated test payment provider interface for local sandbox simulation.
 * Ensures zero storage of sensitive cardholder information (PAN, CVV) in compliance with security guidelines.
 */

export type PaymentMethodType = 'SIMULATED_CARD' | 'CASH_ON_DELIVERY' | 'APEX_POINTS';

export interface PaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  provider: PaymentMethodType;
  cardName?: string;
  cardLast4?: string;
  cardBrand?: string;
  simulateFailure?: boolean;
}

export interface PaymentResult {
  success: boolean;
  status: 'PAID' | 'PENDING' | 'FAILED';
  providerReference: string;
  errorMessage?: string;
  metadata: {
    isSandbox: true;
    timestamp: string;
    authCode?: string;
    method: PaymentMethodType;
  };
}

export class MockPaymentAdapter {
  /**
   * Processes a transaction in simulated test mode.
   * Produces predictable outcomes based on test card configuration.
   */
  public static async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    const timestamp = new Date().toISOString();

    // Cash on Delivery remains pending payment until physical fulfillment
    if (request.provider === 'CASH_ON_DELIVERY') {
      return {
        success: true,
        status: 'PENDING',
        providerReference: `COD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        metadata: {
          isSandbox: true,
          timestamp,
          method: 'CASH_ON_DELIVERY',
        },
      };
    }

    // Apex Points is settled immediately
    if (request.provider === 'APEX_POINTS') {
      return {
        success: true,
        status: 'PAID',
        providerReference: `PTS-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        metadata: {
          isSandbox: true,
          timestamp,
          authCode: `AUTH-PTS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          method: 'APEX_POINTS',
        },
      };
    }

    // Simulated Card payments
    if (request.simulateFailure || request.cardLast4 === '0000') {
      return {
        success: false,
        status: 'FAILED',
        providerReference: `SIM-FAIL-${Date.now()}`,
        errorMessage: 'The simulated card transaction was declined by the test issuing bank.',
        metadata: {
          isSandbox: true,
          timestamp,
          method: 'SIMULATED_CARD',
        },
      };
    }

    // Successful simulated authorization
    const authCode = `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const providerReference = `SIM-AUTH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      success: true,
      status: 'PAID',
      providerReference,
      metadata: {
        isSandbox: true,
        timestamp,
        authCode,
        method: 'SIMULATED_CARD',
      },
    };
  }

  /**
   * Processes simulated refunds
   */
  public static async processRefund(
    paymentReference: string,
    amount: number
  ): Promise<{ success: boolean; refundReference: string }> {
    return {
      success: true,
      refundReference: `REFUND-${paymentReference}-${Date.now()}`,
    };
  }
}
