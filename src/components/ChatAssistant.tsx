/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, User, Bot, X, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COUNTRIES } from '../data/countries';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  onClose: () => void;
  currentCountry?: string;
}

const SYSTEM_PROMPT = `You are a helpful, trustworthy, and clear AI Election Education Assistant.
Your goal is to help users understand how elections work in their country.

STRICT RULES:
- Never generate fake or assumed information.
- If you are not sure, clearly say: "I am not fully sure. Please verify from official government sources."
- Always base answers on real-world election systems for India, United States, and United Kingdom.
- Do not hallucinate laws, dates, or rules.
- Keep answers simple and structured.
- Use bullet points and steps (Step 1, Step 2...).
- Avoid long paragraphs.
- Use simple English.
- If a user asks about a country not supported (India, USA, UK), prioritize accuracy and state limitations if unsure.

Context from the app:
- Current selected country in UI: {COUNTRY_CONTEXT}
- Supported countries with deep data: India, USA, UK.

Style:
- Clear, helpful, and optimistic but authoritative about facts.
- Not robotic.
- Aim to educate people about the importance of voting.
`;

export default function ChatAssistant({ onClose, currentCountry }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: `Hello! I'm your Election Education Assistant. I can help you understand voting procedures in India, the US, and the UK. ${currentCountry ? `I noticed you're looking at ${currentCountry}.` : ""} Which country do you want to know about?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const refinedPrompt = SYSTEM_PROMPT.replace('{COUNTRY_CONTEXT}', currentCountry || 'None selected');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `System context: ${refinedPrompt}` }] },
          ...messages.map(m => ({ 
            role: m.role === 'assistant' ? 'model' : 'user', 
            parts: [{ text: m.content }] 
          })),
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          temperature: 0.1,
        }
      });

      const aiContent = response.text || "I'm sorry, I couldn't process that request. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please check your internet or try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const isListItem = line.trim().startsWith('-') || line.trim().match(/^\d+\./);
      const isStep = line.trim().toLowerCase().startsWith('step');
      
      const parts = line.split(/(\*\*.*?\*\*)/).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <p key={i} className={`leading-relaxed ${isListItem ? 'pl-4 my-1 text-sm' : 'my-2 text-[15px]'} ${isStep ? 'font-bold text-blue-600 text-lg mt-4' : 'text-slate-600'}`}>
          {parts}
        </p>
      );
    });
  };

  return (
    <>
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 shadow-sm relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Bot size={22} strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 leading-none">CivicMind AI</h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expert Advisor</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
          <X size={18} className="text-slate-400" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50"
      >
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-1 border border-blue-100">
                <Bot size={16} />
              </div>
            )}
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-100 font-medium' 
                : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-none'
            }`}>
              {m.role === 'user' ? m.content : formatContent(m.content)}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-1 border border-blue-100">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Processing...</span>
              </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100 shrink-0 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['India steps', 'US ballot guide', 'UK voting age'].map((hint) => (
            <button 
              key={hint}
              onClick={() => { setInput(`How do I vote? (${hint})`); }}
              className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap uppercase tracking-tight"
            >
              {hint}
            </button>
          ))}
        </div>
        <div className="relative">
          <input 
            type="text"
            placeholder="Search election rules..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full p-4 pl-5 pr-14 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="flex items-center justify-center gap-2">
           <Sparkles size={12} className="text-amber-500" />
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
             Civic Education Data Platform
           </p>
        </div>
      </div>
    </>
  );
}
