import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/catalog.service';

export async function POST(req: Request) {
  try {
    const allProducts = await getProducts({ limit: 200 });

    const { history } = await req.json();
    if (!history || !Array.isArray(history) || history.length === 0) {
      // Return 10 random products if no history
      return NextResponse.json({ 
        products: allProducts.sort(() => 0.5 - Math.random()).slice(0, 10) 
      });
    }

    const recentCategories = Array.from(new Set(history.slice(0, 5).map((h: any) => h.category)));
    const viewedIds = new Set(history.map((h: any) => h.id));
    
    // Find matching categories but NOT the exact items they already viewed
    let suggestions = allProducts
      .filter(p => {
          const cat = p.department || p.category || p.subcategory;
          return recentCategories.includes(cat) && !viewedIds.has(p.id);
      })
      .sort(() => 0.5 - Math.random())
      .slice(0, 12);
      
    // If we didn't find enough, pad with some random products
    if (suggestions.length < 12) {
      const padding = allProducts
         .filter(p => !viewedIds.has(p.id) && !suggestions.find(s => s.id === p.id))
         .sort(() => 0.5 - Math.random())
         .slice(0, 12 - suggestions.length);
      suggestions = [...suggestions, ...padding];
    }
    
    return NextResponse.json({ products: suggestions });
  } catch (error) {
    console.error("API error in recommendations:", error);
    // Fallback if something fails
    const fallback = await getProducts({ limit: 12 });
    return NextResponse.json({ products: fallback });
  }
}
