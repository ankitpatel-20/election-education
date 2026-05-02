/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { QUIZ_QUESTIONS, QuizQuestion } from '../data/quiz';
import { COUNTRIES } from '../data/countries';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, RefreshCw, Award, Info, ArrowRight, Loader2 } from 'lucide-react';
import { fetchQuizQuestions } from '../services/geminiService';

export default function Quiz() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedCountry) {
      loadQuestions();
    }
  }, [selectedCountry]);

  const loadQuestions = async () => {
    if (!selectedCountry) return;
    setIsLoading(true);
    try {
      const countryName = COUNTRIES[selectedCountry].name;
      const aiQuestions = await fetchQuizQuestions(countryName);
      if (aiQuestions && aiQuestions.length > 0) {
        setQuestions(aiQuestions);
      } else {
        // Fallback to static if AI fails
        setQuestions(QUIZ_QUESTIONS[selectedCountry] || []);
      }
    } catch (error) {
      console.error("Failed to load questions:", error);
      setQuestions(QUIZ_QUESTIONS[selectedCountry] || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountrySelect = (id: string) => {
    if (selectedCountry === id) {
      loadQuestions(); // Force reload if same country
    } else {
      setSelectedCountry(id);
    }
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setUserAnswer(null);
    setIsAnswerRevealed(false);
  };

  const handleAnswerSelect = (index: number) => {
    if (isAnswerRevealed) return;
    setUserAnswer(index);
    setIsAnswerRevealed(true);
    if (index === questions[currentQuestionIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setUserAnswer(null);
      setIsAnswerRevealed(false);
    } else {
      setShowResult(true);
    }
  };

  if (!selectedCountry) {
    return (
      <div className="space-y-8 py-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black tracking-tight tracking-tight">Democratic <span className="text-indigo-600">Challenge</span></h2>
          <p className="text-gray-500 max-w-md mx-auto">Test your response to real-world voting scenarios and legal situations.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Object.values(COUNTRIES).map((c) => (
            <button
              key={c.id}
              onClick={() => handleCountrySelect(c.id)}
              className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center gap-4 border-b-4 border-transparent hover:border-indigo-600"
            >
              <span className="text-4xl">{c.flag}</span>
              <span className="font-bold text-lg">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto py-32 text-center space-y-6">
        <div className="relative inline-block">
          <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800">Analyzing Scenarios...</h3>
          <p className="text-slate-500 font-medium">Generating real-life situational questions for {COUNTRIES[selectedCountry].name}.</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-32 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
          <X size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800">Verification Error</h3>
          <p className="text-slate-500 font-medium italic">We couldn't verify situational data for {COUNTRIES[selectedCountry].name} at this time.</p>
        </div>
        <button 
          onClick={() => setSelectedCountry(null)}
          className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
        >
          Try Another Country
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-xl mx-auto py-8">
      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-blue-600 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-blue-100 space-y-8"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div>
                 <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Knowledge Check</p>
                 <h2 className="text-xl font-bold">Question {currentQuestionIndex + 1} of {questions.length}</h2>
              </div>
              <button 
                onClick={() => setSelectedCountry(null)}
                className="text-xs font-bold text-white/50 hover:text-white underline uppercase tracking-tight"
              >
                Switch Country
              </button>
            </div>

            <h3 className="text-2xl font-bold leading-tight">
              {currentQuestion.question}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                let statusClass = "bg-white/10 border-white/20 hover:bg-white/20";
                if (isAnswerRevealed) {
                  if (idx === currentQuestion.correctAnswer) statusClass = "bg-emerald-500 border-emerald-400 text-white font-bold ring-4 ring-emerald-500/30";
                  else if (idx === userAnswer) statusClass = "bg-rose-500 border-rose-400 text-white font-bold ring-4 ring-rose-500/30";
                  else statusClass = "bg-white/5 border-transparent text-white/40";
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerRevealed}
                    onClick={() => handleAnswerSelect(idx)}
                    className={`w-full p-5 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between group ${statusClass}`}
                  >
                    {option}
                    {!isAnswerRevealed && <div className="w-5 h-5 rounded-full border border-white/30 group-hover:border-white transition-colors" />}
                    {isAnswerRevealed && idx === currentQuestion.correctAnswer && <Check size={18} className="text-white" />}
                    {isAnswerRevealed && idx === userAnswer && idx !== currentQuestion.correctAnswer && <X size={18} className="text-white" />}
                  </button>
                );
              })}
            </div>

            {isAnswerRevealed && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-6 border-t border-white/10 space-y-6"
              >
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 bg-blue-400/20 rounded-lg flex items-center justify-center">
                    <Info size={16} className="text-blue-200" />
                  </div>
                  <p className="text-sm text-blue-100 leading-relaxed font-medium italic">
                    {currentQuestion.explanation}
                  </p>
                </div>
                <button 
                  onClick={nextQuestion}
                  className="w-full py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2"
                >
                  {currentQuestionIndex === questions.length - 1 ? 'See Results' : 'Next Question'}
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 p-12 rounded-[3.5rem] border border-slate-800 shadow-2xl text-center space-y-8 text-white"
          >
            <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto ring-8 ring-blue-600/20 rotate-3">
              <Award size={40} />
            </div>
            <div className="space-y-1">
              <h2 className="text-4xl font-extrabold tracking-tight">Quiz Complete!</h2>
              <p className="text-slate-400 font-medium">Voter knowledge review finished.</p>
            </div>
            
            <div className="p-10 bg-slate-800/50 rounded-[2.5rem] border border-slate-700/50">
              <span className="text-7xl font-black text-blue-500">{score}<span className="text-3xl text-slate-600">/{questions.length}</span></span>
              <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Your Knowledge Score</p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleCountrySelect(selectedCountry)}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20"
              >
                Retake Quiz
              </button>
              <button 
                onClick={() => setSelectedCountry(null)}
                className="w-full py-4 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-all"
              >
                Exit to Home
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
