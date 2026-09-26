# PEHNO STYLIST - Recommendation Schema

Based on the audit, we will execute a Prisma schema migration to add the following fields to the `Product` model.

## Proposed Prisma Updates (Phase 1)

```prisma
model Product {
  // ... existing fields ...

  // PEHNO STYLIST - Stylistic Metadata
  garmentRole       String?   // e.g., "TOP", "BOTTOM", "FOOTWEAR"
  colorFamily       String?   // Normalized color for compatibility logic
  styleTags         String[]  // e.g., ["smart-casual", "minimal"]
  occasionTags      String[]  // e.g., ["date", "office"]
  seasonTags        String[]  // e.g., ["summer", "spring"]
  
  // PEHNO STYLIST - Scoring
  formalityScore    Float?    // 0.0 to 1.0
  versatilityScore  Float?    // 0.0 to 1.0
  trendScore        Float?    // 0.0 to 1.0
  comfortScore      Float?    // 0.0 to 1.0
  
  // PEHNO STYLIST - Embeddings (Requires pgvector)
  // Unsupported by native Prisma without raw queries or preview features:
  // embedding        Unsupported("vector(1536)")?
  embeddingVersion  Int       @default(1)
  
  // ...
}
```

## User Preferences Schema (Phase 9)

```prisma
model UserPreferences {
  id                  String   @id @default(cuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id])
  
  favoriteCategories  String[]
  favoriteColors      String[]
  preferredFit        String?
  priceSensitivity    Float    @default(0.5) // 0.0 (Budget) to 1.0 (Luxury)
  
  updatedAt           DateTime @updatedAt
}
```
