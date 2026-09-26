'use client';

import { useEffect } from 'react';

export default function ProductHistoryTracker({ 
  productId, 
  category, 
  title, 
  image 
}: { 
  productId: string, 
  category: string,
  title: string,
  image: string
}) {
  useEffect(() => {
    try {
      const historyStr = localStorage.getItem('pehno_browsing_history');
      let history = historyStr ? JSON.parse(historyStr) : [];
      
      // Remove if already exists to put it at the front
      history = history.filter((item: any) => item.id !== productId);
      
      // Add to front
      history.unshift({ id: productId, category, title, image, timestamp: Date.now() });
      
      // Keep only last 20
      history = history.slice(0, 20);
      
      localStorage.setItem('pehno_browsing_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to track history', e);
    }
  }, [productId, category, title, image]);

  return null;
}
