/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { COUNTRIES } from '../data/countries';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, MapPin, Calendar, CheckCircle, XCircle, Info } from 'lucide-react';

export default function EligibilityChecker() {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState<string | null>(null);
  const [age, setAge] = useState<string>('');
  const [citizen, setCitizen] = useState<boolean | null>(null);

  const reset = () => {
    setStep(1);
    setCountry(null);
    setAge('');
    setCitizen(null);
  };

  const isEligible = () => {
    if (!country || !age || citizen === null) return false;
    const ageNum = parseInt(age);
    if (isNaN(ageNum)) return false;

    if (ageNum < 18) return false;
    if (citizen === false) return false;
    
    return true;
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Eligibility Checker</h2>
        <p className="text-slate-500 font-medium leading-relaxed">Quickly find out if you meet the baseline requirements to vote.</p>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm min-h-[450px] flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6 flex-1"
            >
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                <MapPin size={12} className="text-blue-500" />
                Step 01: Select Region
              </label>
              <div className="grid grid-cols-1 gap-3">
                {Object.values(COUNTRIES).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setCountry(c.id); setStep(2); }}
                    className={`p-5 rounded-xl border-2 text-left font-bold transition-all flex items-center gap-4 ${country === c.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'}`}
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <span className="tracking-tight">{c.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8 flex-1"
            >
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                <Calendar size={12} className="text-blue-500" />
                Step 02: Age Verification
              </label>
              <div className="space-y-4">
                <input 
                  type="number"
                  placeholder="Enter your age (e.g. 18)"
                  value={age}
                  autoFocus
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:bg-white outline-none text-2xl font-black placeholder:text-slate-300 transition-all"
                />
                <button
                  disabled={!age}
                  onClick={() => setStep(3)}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8 flex-1"
            >
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                <UserCheck size={12} className="text-blue-500" />
                Step 03: Citizenship Status
              </label>
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800">Are you a recognized citizen of {country ? COUNTRIES[country].name : 'the selected region'}?</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => { setCitizen(true); setStep(4); }}
                    className="p-6 rounded-xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 transition-all text-center font-bold text-slate-700"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => { setCitizen(false); setStep(4); }}
                    className="p-6 rounded-xl border-2 border-slate-100 hover:border-rose-600 hover:bg-rose-50 transition-all text-center font-bold text-slate-700"
                  >
                    No
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-10 flex-1 flex flex-col justify-center"
            >
              {isEligible() ? (
                <>
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center ring-8 ring-emerald-50 border border-emerald-100 rotate-3">
                      <CheckCircle size={40} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Verified Eligible</h3>
                      <p className="text-slate-500 font-medium">You meet the requirements for {country ? COUNTRIES[country].name : ''}!</p>
                    </div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left space-y-3">
                    <div className="font-bold flex items-center gap-2 text-slate-800">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                      What's next?
                    </div>
                    <p className="leading-relaxed font-medium">
                      The next step is to ensure you are in the Voter List. Check out our <span className="text-blue-600 font-bold">Registration Guide</span> for a step-by-step walkthrough.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center ring-8 ring-rose-50 border border-rose-100 -rotate-3">
                    <XCircle size={40} />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Access Restricted</h3>
                      <p className="text-slate-500 font-medium">
                        You may not meet the criteria for the upcoming cycle.
                      </p>
                    </div>
                    <div className="bg-slate-100 p-4 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-tight">
                      Reason: {parseInt(age) < 18 ? "Age requirement (18+) not met" : "Citizenship status required"}
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                onClick={reset}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 mt-auto"
              >
                Restart Eligibility Check
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
        <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
          <span className="font-bold">Provisional Advice:</span> This tool provides a baseline check based on national laws. Specific residency rules or local disqualifications may apply. Always consult official commission documentation.
        </p>
      </div>
    </div>
  );
}
