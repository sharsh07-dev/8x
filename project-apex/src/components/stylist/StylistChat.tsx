'use client';

import { useState, useRef, useEffect } from 'react';
import { StylistResponse, OutfitLook, StylistProduct } from '@/lib/stylist/types';
import StylistProductCard from './StylistProductCard';
import OutfitLookCard from './OutfitLookCard';
import StylistIntentChip from './StylistIntentChip';
import { Sparkles, Send, RefreshCw, ChevronRight, Shirt } from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// PEHNO STYLIST — Main Chat Interface (Phase 8)
// ═══════════════════════════════════════════════════════════

const PROMPT_SUGGESTIONS = [
  "I have a date tonight 💕",
  "College outfit under ₹1500 🎓",
  "Wedding guest look 💍",
  "Goa trip essentials 🏖️",
  "Office-ready under ₹3000 💼",
  "All-black party look 🖤",
];

type Message =
  | { type: 'user'; text: string }
  | { type: 'assistant'; data: StylistResponse; text: string };

export default function StylistChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstMessage = messages.length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { type: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const endpoint = sessionId ? '/api/stylist/refine' : '/api/stylist/recommend';
      const body = sessionId
        ? { message: text, sessionId }
        : { message: text };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId);
      }

      const assistantMsg: Message = {
        type: 'assistant',
        data: data as StylistResponse,
        text: data.reasoningSummary,
      };
      setMessages(prev => [...prev, assistantMsg]);

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSuggestion(s: string) {
    sendMessage(s.replace(/[💕🎓💍🏖️💼🖤]/g, '').trim());
  }

  function resetChat() {
    setMessages([]);
    setSessionId(null);
    setError(null);
    setInput('');
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col h-full min-h-[80vh] max-w-4xl mx-auto">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E67661] to-[#c4513c] flex items-center justify-center shadow-md">
            <Shirt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-[#171717] tracking-tight font-mono uppercase">
              Pehno Stylist
            </h1>
            <p className="text-xs text-[#6B7280]">Your personal AI fashion expert</p>
          </div>
        </div>
        {!isFirstMessage && (
          <button
            onClick={resetChat}
            className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#E67661] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#F9F6F1]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> New Session
          </button>
        )}
      </div>

      {/* ── Hero (visible only before first message) ───────── */}
      {isFirstMessage && (
        <div className="flex flex-col items-center text-center py-12 gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#E67661] to-[#c4513c] flex items-center justify-center shadow-xl">
            <Shirt className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#171717] tracking-tight font-mono uppercase mb-2">
              What do you want to wear?
            </h2>
            <p className="text-[#6B7280] max-w-md text-sm leading-relaxed">
              Tell me the occasion, your style, budget — anything. I'll find real Pehno outfits that work for you.
            </p>
          </div>

          {/* Prompt suggestions */}
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {PROMPT_SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="px-4 py-2 rounded-full border border-[#E3E1DD] bg-white text-sm text-[#4B4B4B] hover:border-[#E67661] hover:text-[#E67661] hover:bg-[#FFF6F3] transition-all duration-150"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Conversation ─────────────────────────────────── */}
      <div className="flex flex-col gap-6 flex-1">
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.type === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-md bg-[#171717] text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed">
                  {msg.text}
                </div>
              </div>
            ) : (
              <AssistantMessage data={msg.data} text={msg.text} />
            )}
          </div>
        ))}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center gap-3 py-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E67661] to-[#c4513c] flex items-center justify-center">
              <Shirt className="w-4 h-4 text-white" />
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#E67661] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-[#6B7280] italic">Styling your look...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ─────────────────────────────────────────── */}
      <div className="sticky bottom-0 bg-white border-t border-[#E3E1DD] pt-4 mt-4">
        {!isFirstMessage && (
          <p className="text-[10px] text-[#9CA3AF] mb-2 text-center">
            Refine your look — "make it black", "under ₹2000", "more casual"
          </p>
        )}
        <form
          onSubmit={e => { e.preventDefault(); sendMessage(input); }}
          className="flex items-center gap-3 bg-[#F9F6F1] border border-[#E3E1DD] rounded-2xl px-4 py-3 focus-within:border-[#E67661] focus-within:ring-2 focus-within:ring-[#E67661]/10 transition-all"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isFirstMessage
              ? "Tell me what you want to wear..."
              : "Refine your look..."}
            className="flex-1 bg-transparent text-sm text-[#171717] placeholder:text-[#9CA3AF] outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-[#E67661] flex items-center justify-center text-white hover:bg-[#c4513c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-[#C4C4C4] text-center mt-2">
          Only real Pehno inventory — no invented products
        </p>
      </div>
    </div>
  );
}

// ── Assistant Message ─────────────────────────────────────────
function AssistantMessage({ data, text }: { data: StylistResponse; text: string }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Avatar + summary */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E67661] to-[#c4513c] flex items-center justify-center shrink-0 mt-0.5">
          <Shirt className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-[#171717] leading-relaxed">{text}</p>
          {/* Intent chips */}
          <div className="flex flex-wrap gap-1.5">
            {data.intent.occasion && <StylistIntentChip icon="💕" label={data.intent.occasion} />}
            {data.intent.budget_max && <StylistIntentChip icon="💰" label={`Under ₹${data.intent.budget_max.toLocaleString()}`} />}
            {data.intent.colors.map(c => <StylistIntentChip key={c} icon="🎨" label={c} />)}
            {data.intent.styles.slice(0, 2).map(s => <StylistIntentChip key={s} icon="✨" label={s} />)}
          </div>
        </div>
      </div>

      {/* Clarification question */}
      {data.clarificationQuestion && (
        <div className="ml-11 bg-[#FFF6F3] border border-[#E67661]/30 rounded-xl px-4 py-3 text-sm text-[#E67661]">
          {data.clarificationQuestion}
        </div>
      )}

      {/* Outfit looks */}
      {data.looks.length > 0 && (
        <div className="ml-11 flex flex-col gap-4">
          {data.looks.map(look => (
            <OutfitLookCard key={look.id} look={look} />
          ))}
        </div>
      )}

      {/* Individual products */}
      {data.individualProducts.length > 0 && (
        <div className="ml-11">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.individualProducts.map(p => (
              <StylistProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {data.looks.length === 0 && data.individualProducts.length === 0 && (
        <div className="ml-11 text-sm text-[#6B7280] bg-[#F9F6F1] rounded-xl px-4 py-3">
          I couldn't find exact matches in current inventory. Try adjusting your budget or style.
        </div>
      )}
    </div>
  );
}
