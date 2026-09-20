import { mockProducts } from '@/data/mockProducts';

export interface DeliveryOption {
  id: string;
  name: string;
  speed: string;
  price: number;
  estimatedDelivery: string;
  description: string;
}

export const DELIVERY_OPTIONS: Record<string, DeliveryOption> = {
  FREE_STANDARD: {
    id: 'FREE_STANDARD',
    name: 'FREE Apex Delivery',
    speed: '3-5 Business Days',
    price: 0.0,
    estimatedDelivery: 'Thursday, Sep 24',
    description: 'Free standard shipping on qualifying orders',
  },
  EXPEDITED: {
    id: 'EXPEDITED',
    name: 'Expedited Delivery',
    speed: '2 Business Days',
    price: 6.99,
    estimatedDelivery: 'Tuesday, Sep 22',
    description: 'Get your package faster with expedited carrier handling',
  },
  ONE_DAY: {
    id: 'ONE_DAY',
    name: 'One-Day Prime Priority',
    speed: 'Next Day (Morning)',
    price: 12.99,
    estimatedDelivery: 'Tomorrow by 11:00 AM',
    description: 'Guaranteed next-morning doorstep delivery',
  },
};

export interface PricingCalculationResult {
  items: {
    productId: string;
    productTitle: string;
    productImage: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  deliveryOption: DeliveryOption;
  appliedPromo?: string;
}

/**
 * Calculates authoritative pricing on the server based on product database/catalog.
 * All financial values are rounded to 2 decimal places to avoid floating point anomalies.
 */
export function calculateOrderPricing(
  items: { productId: string; quantity: number }[],
  deliveryOptionId: string = 'FREE_STANDARD',
  promoCode?: string
): { success: true; pricing: PricingCalculationResult } | { success: false; error: string } {
  if (!items || items.length === 0) {
    return { success: false, error: 'No items provided for pricing calculation' };
  }

  const deliveryOption = DELIVERY_OPTIONS[deliveryOptionId] || DELIVERY_OPTIONS.FREE_STANDARD;

  const itemDetails: PricingCalculationResult['items'] = [];
  let subtotalCents = 0;

  for (const item of items) {
    if (!item.quantity || item.quantity <= 0) {
      return { success: false, error: `Invalid quantity ${item.quantity} for product ${item.productId}` };
    }

    const product = mockProducts.find((p) => p.id === item.productId);
    if (!product) {
      return { success: false, error: `Product with ID "${item.productId}" was not found in catalog` };
    }

    const unitPriceCents = Math.round(product.price * 100);
    const lineTotalCents = unitPriceCents * item.quantity;
    subtotalCents += lineTotalCents;

    itemDetails.push({
      productId: product.id,
      productTitle: product.title,
      productImage: product.image,
      unitPrice: product.price,
      quantity: item.quantity,
      lineTotal: Math.round(lineTotalCents) / 100,
    });
  }

  // Shipping fee
  let shippingCents = Math.round(deliveryOption.price * 100);
  // Free standard shipping if subtotal >= $35
  if (deliveryOption.id === 'FREE_STANDARD' && subtotalCents < 3500) {
    // If below $35 and not prime standard, minimal standard fee is $4.99
    shippingCents = 499;
  } else if (deliveryOption.id === 'FREE_STANDARD') {
    shippingCents = 0;
  }

  // Discounts
  let discountCents = 0;
  let appliedPromo: string | undefined = undefined;
  if (promoCode) {
    const cleanCode = promoCode.trim().toUpperCase();
    if (cleanCode === 'APEX10') {
      discountCents = Math.round(subtotalCents * 0.1);
      appliedPromo = 'APEX10 (10% Off Storewide)';
    } else if (cleanCode === 'WELCOME15') {
      discountCents = 1500; // $15 off
      appliedPromo = 'WELCOME15 ($15 Off)';
    } else if (cleanCode === 'FREESHIP') {
      discountCents = shippingCents;
      shippingCents = 0;
      appliedPromo = 'FREESHIP (Free Delivery)';
    }
  }

  if (discountCents > subtotalCents) {
    discountCents = subtotalCents;
  }

  // Tax calculation: 7.5% of (subtotal - discount)
  const taxableCents = Math.max(0, subtotalCents - discountCents);
  const taxCents = Math.round(taxableCents * 0.075);

  const totalCents = subtotalCents - discountCents + shippingCents + taxCents;

  return {
    success: true,
    pricing: {
      items: itemDetails,
      subtotal: subtotalCents / 100,
      shipping: shippingCents / 100,
      tax: taxCents / 100,
      discount: discountCents / 100,
      total: totalCents / 100,
      currency: 'USD',
      deliveryOption: {
        ...deliveryOption,
        price: shippingCents / 100,
      },
      appliedPromo,
    },
  };
}
