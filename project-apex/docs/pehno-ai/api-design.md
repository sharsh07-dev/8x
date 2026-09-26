# PEHNO STYLIST - API Design

The AI Stylist will be powered by strict, structured JSON APIs. No raw LLM prose will be leaked to the frontend client.

## 1. Intent Extraction & Recommendation Retrieval

**Endpoint:** `POST /api/stylist/recommend`

**Request Body:**
```json
{
  "message": "I need something stylish for a dinner date under 3000",
  "sessionId": "sess_12345",
  "context": {
    "gender": "Men"
  }
}
```

**Response:**
```json
{
  "sessionId": "sess_12345",
  "intent": {
    "occasion": "date",
    "style": ["stylish", "smart-casual"],
    "budgetMax": 3000,
    "outfitMode": "complete_outfit",
    "confidence": 0.92
  },
  "looks": [
    {
      "id": "look-1",
      "name": "Evening Smart Casual",
      "description": "A polished dark-toned look perfect for a dinner date.",
      "totalPrice": 2899,
      "products": [
        {
          "product": { ... },
          "role": "TOP",
          "matchScore": 0.95,
          "explanation": "✓ Matches your dinner date occasion\n✓ Under your budget"
        },
        {
          "product": { ... },
          "role": "BOTTOM",
          "matchScore": 0.88,
          "explanation": "✓ Pairs perfectly with the top"
        }
      ]
    }
  ],
  "reasoningSummary": "I've put together a smart-casual look focused on dark, evening-appropriate tones that keeps you comfortably under your ₹3,000 budget."
}
```

## 2. Refinement (Context-Aware)

**Endpoint:** `POST /api/stylist/refine`

Allows the user to adjust the current session's parameters without losing context.
**Example Request:**
```json
{
  "sessionId": "sess_12345",
  "message": "Make it black instead",
  "action": "UPDATE_COLOR"
}
```

## 3. Background Tool Definitions (For LLM)

The LLM will be restricted to the following internal tools using Structured Outputs:
- `search_products(filters, minPrice, maxPrice, categories)`
- `check_compatibility(topId, bottomId)`
- `get_inventory(productId)`
