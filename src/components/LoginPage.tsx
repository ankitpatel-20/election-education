import { motion } from 'motion/react';
import { Bot, LogIn, Globe, ShieldCheck, Gavel, UserCheck } from 'lucide-react';
import { auth, db, signInWithGoogle } from '../lib/firebase';
import { useState } from 'react';
import { COUNTRIES } from '../data/countries';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('us');

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      
      // Check if profile exists
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          homeCountryId: selectedCountry,
          favoriteCountries: ['in', 'us', 'gb', selectedCountry].filter((v, i, a) => a.indexOf(v) === i),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 font-sans">
      {/* Visual Side */}
      <div className="relative hidden lg:flex flex-col justify-center p-20 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 space-y-12"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
              <Globe size={32} className="text-white" />
            </div>
            <span className="text-3xl font-black text-white tracking-tighter uppercase italic">CivicMind</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-7xl font-light text-white leading-[0.9] tracking-tight">
              Global <span className="font-bold text-blue-400">Election</span> Data Portal.
            </h1>
            <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
              Access verified voting procedures, registration deadlines, and eligibility criteria for over 50 nations in one unified interface.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-800">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Data Integrity</span>
              <div className="flex items-center gap-2 text-white font-bold">
                <ShieldCheck size={18} className="text-emerald-400" />
                AI-Verified Protocols
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Legal Framework</span>
              <div className="flex items-center gap-2 text-white font-bold">
                <Gavel size={18} className="text-blue-400" />
                Constitutional Accuracy
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-8 bg-white lg:bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-10 lg:p-12 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-8"
        >
          <div className="text-center space-y-3">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                <Globe size={20} />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">CivicMind</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Set Your Citizenship</h2>
            <p className="text-slate-500 font-medium text-sm">Select your home country to personalize your democratic guide.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <UserCheck size={12} />
                Confirm Home Country
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
                {Object.values(COUNTRIES).map((country) => (
                  <button
                    key={country.id}
                    onClick={() => setSelectedCountry(country.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-sm font-bold ${
                      selectedCountry === country.id 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{country.flag}</span>
                      {country.name}
                    </div>
                    {selectedCountry === country.id && <ShieldCheck size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In to Continue
                </>
              )}
            </button>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black text-slate-300">
                <span className="bg-white px-4">Trusted Access</span>
              </div>
            </div>

            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
                <Bot size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Onboarding Guide</p>
                <p className="text-[12px] text-blue-700 leading-relaxed font-semibold">
                  Choosing your citizenship allows our AI to highlight specific registration deadlines unique to you.
                </p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-center text-slate-400 font-medium leading-relaxed max-w-[280px] mx-auto uppercase tracking-wider">
            By joining, you agree to our <span className="text-slate-600 underline font-bold cursor-pointer">Civic Protocol</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
