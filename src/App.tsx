/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Vote, 
  MapPin, 
  Info, 
  CheckCircle2, 
  HelpCircle, 
  ArrowLeft, 
  MessageSquare,
  BarChart3,
  Search,
  X,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { COUNTRIES } from './data/countries';
import { CountryData } from './types';
import CountrySelector from './components/CountrySelector';
import ElectionDetails from './components/ElectionDetails';
import ComparisonTable from './components/ComparisonTable';
import Quiz from './components/Quiz';
import EligibilityChecker from './components/EligibilityChecker';
import ChatAssistant from './components/ChatAssistant';
import LoginPage from './components/LoginPage';
import { useAuth } from './context/AuthContext';

type ViewMode = 'home' | 'details' | 'compare' | 'quiz' | 'eligibility';

export default function App() {
  const { user, loading, logout, homeCountry } = useAuth();
  const [view, setView] = useState<ViewMode>('home');
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const homeCountryData = homeCountry ? COUNTRIES[homeCountry] : null;

  const handleCountrySelect = (countryId: string) => {
    setSelectedCountry(COUNTRIES[countryId]);
    setView('details');
  };

  const reset = () => {
    setView('home');
    setSelectedCountry(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <Loader2 size={64} className="text-blue-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Vote size={24} className="text-blue-200" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">CivicMind AI</h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Initializing Secure Portal</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <button 
              onClick={reset}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-105">
                <Vote size={18} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">CivicMind AI</span>
            </button>

            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-500">
              <button 
                onClick={() => setView('compare')}
                className={`pb-1 transition-all ${view === 'compare' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-800 border-b-2 border-transparent'}`}
              >
                Compare Systems
              </button>
              <button 
                onClick={() => setView('quiz')}
                className={`pb-1 transition-all ${view === 'quiz' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-800 border-b-2 border-transparent'}`}
              >
                Quiz Mode
              </button>
              <button 
                onClick={() => setView('eligibility')}
                className={`pb-1 transition-all ${view === 'eligibility' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-800 border-b-2 border-transparent'}`}
              >
                Eligibility Guide
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-3 pr-6 border-r border-slate-100">
              <span className="text-xs font-bold text-slate-400">Citizenship:</span>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <span className="text-lg leading-none">{homeCountryData?.flag || '🌐'}</span>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">
                  {homeCountryData?.name || 'Global Citizen'}
                </span>
              </div>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 p-1.5 pl-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 transition-all group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-none">{user.displayName || 'Civic User'}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    {homeCountryData ? `${homeCountryData.name} Citizen` : 'Verified Profile'}
                  </p>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-8 h-8 rounded-lg shadow-sm" />
                ) : (
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <UserIcon size={16} />
                  </div>
                )}
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="fixed inset-0 z-40"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Signed in via</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <div className="px-4 py-2 flex items-center gap-3 border-b border-slate-50 mb-1">
                           <span className="text-xl">{homeCountryData?.flag}</span>
                           <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{homeCountryData?.name}</span>
                        </div>
                        <button 
                          onClick={() => { logout(); setIsUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 p-3 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors group"
                        >
                          <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                            <LogOut size={16} />
                          </div>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.section
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  Democracy Education <span className="text-blue-600">Reimagined</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                  Understand how elections work across the globe in a clear, step-by-step, and accessible way.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <MapPin size={14} className="text-blue-500" />
                  Select your country to begin
                </div>
                <CountrySelector onSelect={handleCountrySelect} />
              </div>

              <div className="grid md:grid-cols-3 gap-6 pt-8">
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Info size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Verified Sources</h3>
                    <p className="text-sm text-slate-500 mt-1">Data cross-referenced with official Election Commission guidelines.</p>
                  </div>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Structured Paths</h3>
                    <p className="text-sm text-slate-500 mt-1">Four simple steps to register and participate in your local elections.</p>
                  </div>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">24/7 AI Support</h3>
                    <p className="text-sm text-slate-500 mt-1">Instant answers to complex voting questions through our AI assistant.</p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {view === 'details' && selectedCountry && (
            <motion.section
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button 
                onClick={() => setView('home')}
                className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-tight"
              >
                <ArrowLeft size={14} />
                Explore Other Countries
              </button>
              <ElectionDetails country={selectedCountry} />
            </motion.section>
          )}

          {view === 'compare' && (
            <motion.section
              key="compare"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button 
                onClick={() => setView('home')}
                className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-tight"
              >
                <ArrowLeft size={14} />
                Back Home
              </button>
              <ComparisonTable />
            </motion.section>
          )}

          {view === 'quiz' && (
            <motion.section
              key="quiz"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <Quiz />
            </motion.section>
          )}

          {view === 'eligibility' && (
            <motion.section
              key="eligibility"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
               <button 
                onClick={() => setView('home')}
                className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-tight"
              >
                <ArrowLeft size={14} />
                Back home
              </button>
              <EligibilityChecker />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* AI Assistant FAB */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          title="Ask AI Assistant"
        >
          {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 border-l border-slate-200 overflow-hidden flex flex-col"
            >
              <ChatAssistant onClose={() => setIsChatOpen(false)} currentCountry={selectedCountry?.name} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="bg-slate-100 border-t border-slate-200 px-8 py-4 shrink-0 flex flex-col md:flex-row justify-between items-center gap-4 mt-20">
        <p className="text-xs text-slate-500">I am an AI assistant. I am not fully sure. Please verify from official government sources.</p>
        <p className="text-xs font-mono text-slate-400 uppercase tracking-tighter">v1.0.4 • Public Domain Education</p>
      </footer>
    </div>
  );
}
