export class TaxService {
  /**
   * Calculate tax based on the delivery address and subtotal.
   * For this implementation, we use a simple rule-based engine.
   */
  static calculateTax(subtotal: number, state: string, country: string): number {
    let taxRate = 0;

    // Simple rule-based tax engine
    if (country.toLowerCase() === 'us' || country.toLowerCase() === 'united states') {
      const stateRates: Record<string, number> = {
        'CA': 0.0725,
        'NY': 0.04,
        'TX': 0.0625,
        'FL': 0.06,
        'WA': 0.065
      };
      taxRate = stateRates[state.toUpperCase()] || 0.05; // Default 5% for other US states
    } else if (country.toLowerCase() === 'in' || country.toLowerCase() === 'india') {
      taxRate = 0.18; // 18% GST standard
    } else {
      taxRate = 0.10; // 10% standard international tax
    }

    // Return rounded to 2 decimal places
    return Math.round(subtotal * taxRate * 100) / 100;
  }
}
