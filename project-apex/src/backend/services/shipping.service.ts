import crypto from 'crypto';

export interface ShippingOption {
  id: string;
  name: string;
  cost: number;
  estimatedDays: number;
}

export class ShippingService {
  /**
   * Available shipping options
   */
  static readonly OPTIONS: Record<string, ShippingOption> = {
    'FREE_STANDARD': { id: 'FREE_STANDARD', name: 'Standard Delivery', cost: 0, estimatedDays: 5 },
    'EXPRESS_2DAY': { id: 'EXPRESS_2DAY', name: '2-Day Express', cost: 12.99, estimatedDays: 2 },
    'NEXT_DAY': { id: 'NEXT_DAY', name: 'Next Day Air', cost: 24.99, estimatedDays: 1 },
  };

  /**
   * Calculate shipping cost based on the chosen option and cart subtotal.
   * Standard shipping might be free over a certain threshold.
   */
  static calculateShipping(subtotal: number, optionId: string): { cost: number, estimatedDelivery: string, method: string } {
    const option = ShippingService.OPTIONS[optionId] || ShippingService.OPTIONS['FREE_STANDARD'];
    
    let cost = option.cost;
    
    // Threshold rule: Free standard shipping for orders over $50
    if (option.id === 'FREE_STANDARD' && subtotal < 50) {
      cost = 5.99; // Fallback cost if threshold not met
    }

    const estimatedDate = new Date(Date.now() + option.estimatedDays * 24 * 60 * 60 * 1000);

    return {
      cost,
      estimatedDelivery: estimatedDate.toISOString(),
      method: option.name
    };
  }

  /**
   * Generate a mock tracking number when an order is shipped.
   */
  static generateTrackingNumber(carrier: 'FEDEX' | 'UPS' | 'USPS' = 'FEDEX'): string {
    const randomHex = crypto.randomBytes(6).toString('hex').toUpperCase();
    
    switch(carrier) {
      case 'FEDEX': return `FX-${randomHex}`;
      case 'UPS': return `1Z${randomHex}89012345`;
      case 'USPS': return `94001${randomHex}1234`;
      default: return `TRK-${randomHex}`;
    }
  }
}
