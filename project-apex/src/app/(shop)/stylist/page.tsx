import type { Metadata } from 'next';
import StylistChat from '@/components/stylist/StylistChat';

export const metadata: Metadata = {
  title: 'PEHNO Stylist — Your AI Fashion Expert',
  description: 'Tell PEHNO Stylist what you want to wear — date night, office, wedding, vacation — and get real outfit recommendations from our inventory.',
};

export default function StylistPage() {
  return (
    <main className="min-h-screen bg-[#F9F6F1]">
      {/* Hero banner */}
      <div className="w-full bg-gradient-to-r from-[#171717] via-[#2C1810] to-[#171717] py-6 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] text-[#E67661] font-mono uppercase tracking-[0.3em] mb-1">Powered by AI</p>
          <h1 className="text-2xl font-bold text-white font-mono uppercase tracking-wider">
            PEHNO STYLIST
          </h1>
          <p className="text-[#9CA3AF] text-xs mt-1">
            Real inventory · Real outfits · No guesswork
          </p>
        </div>
      </div>

      {/* Chat container */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <StylistChat />
      </div>
    </main>
  );
}
