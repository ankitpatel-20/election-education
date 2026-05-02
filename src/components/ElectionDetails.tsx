/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CountryData } from '../types';
import { 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  Settings, 
  Clock, 
  Users,
  Info,
  Loader2,
  Sparkles,
  AlertCircle,
  History as HistoryIcon,
  BookOpen,
  TrendingUp,
  MapPin,
  Crown,
  Award,
  UserCheck,
  Twitter,
  Instagram,
  Facebook,
  Book,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { fetchCountryDetails, fetchCountryHistory, fetchLeadershipData } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface Props {
  country: CountryData;
}

export default function ElectionDetails({ country }: Props) {
  const { homeCountry } = useAuth();
  const [details, setDetails] = useState<Partial<CountryData> | null>(country.isDetailed ? country : null);
  const [history, setHistory] = useState<CountryData['history'] | null>(null);
  const [leadership, setLeadership] = useState<CountryData['leadership'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'leadership'>('overview');
  const [error, setError] = useState<string | null>(null);
  const [leaderSearch, setLeaderSearch] = useState('');

  const isHomeCountry = homeCountry === country.id;

  const filteredPastLeaders = leadership?.historical.filter(l => 
    l.name.toLowerCase().includes(leaderSearch.toLowerCase()) ||
    l.party.toLowerCase().includes(leaderSearch.toLowerCase())
  ) || [];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const mainData = !country.isDetailed ? await fetchCountryDetails(country.name) : country;
        setDetails(mainData);
        
        // Use the bundled leadership and history from mainData
        if (mainData.leadership) {
          setLeadership(mainData.leadership);
        }
        
        if (mainData.history) {
          setHistory(mainData.history);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [country]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
        <div className="relative">
          <Loader2 size={48} className="text-blue-600 animate-spin" />
          <Sparkles size={20} className="text-amber-400 absolute -top-2 -right-2 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-800">Verifying Official Protocols...</h3>
          <p className="text-slate-500 font-medium">Our AI is cross-referencing government databases for {country.name}.</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-2 h-2 bg-blue-100 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-800">Connection Interrupted</h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto">{error || "Could not retrieve election data for this region at this moment."}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simulation/Quota Warning */}
      {(details as any)?.isSimulated && (
        <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-3xl flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-amber-100">
              <Zap className="text-amber-500" size={20} />
            </div>
            <div>
              <span className="text-xs font-black text-amber-900 uppercase tracking-widest block leading-none mb-1">
                {(details as any)?.isErrorState ? 'Sync Interrupted' : 'Simulation Mode'}
              </span>
              <p className="text-[10px] text-amber-700 font-medium leading-none">
                {(details as any)?.isErrorState ? 'API Quota reached. Showing placeholders.' : 'Displaying verified static profile.'}
              </p>
            </div>
          </div>
          <div className="text-[10px] font-bold text-amber-500 bg-white px-3 py-1.5 rounded-xl border border-amber-100 uppercase tracking-widest">
            Offline
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
      <div className="space-y-8">
        <header className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {country.name}
              </h1>
              {isHomeCountry && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                  <UserCheck size={12} />
                  My Home Country
                </div>
              )}
              {!country.isDetailed && (
                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-200 flex items-center gap-1">
                  <Sparkles size={10} /> AI Verified
                </span>
              )}
            </div>

            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-start">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <BookOpen size={14} />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <HistoryIcon size={14} />
                History
              </button>
              <button
                onClick={() => setActiveTab('leadership')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'leadership' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Crown size={14} />
                Leadership
              </button>
            </div>
          </div>
          <p className="text-slate-500 font-medium">Verified election protocol, historical origins, and leadership performance data.</p>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid gap-4">
                {/* Eligibility Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-6">
                  <div className="shrink-0 w-10 h-10 bg-blue-50 text-blue-600 font-bold flex items-center justify-center rounded-full border border-blue-100">1</div>
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-slate-400" />
                      <h3 className="font-bold text-slate-800">Check Eligibility</h3>
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600 list-disc list-inside">
                      {details.eligibility?.map((criteria, i) => (
                        <li key={i} className="marker:text-blue-400 leading-relaxed font-medium">
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Registration Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-6">
                  <div className="shrink-0 w-10 h-10 bg-blue-50 text-blue-600 font-bold flex items-center justify-center rounded-full border border-blue-100">2</div>
                  <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-2">
                      <Settings size={18} className="text-slate-400" />
                      <h3 className="font-bold text-slate-800">Register to Vote</h3>
                    </div>
                    <div className="grid gap-2">
                      {details.registration?.steps.map((step, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-xl text-sm font-medium text-slate-700 border border-slate-100 outline-none">
                          {step}
                        </div>
                      ))}
                    </div>
                    {details.registration?.link && (
                      <a 
                        href={details.registration.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100/50 text-sm"
                      >
                        Go to Official Registration Portal
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Documents Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-6">
                  <div className="shrink-0 w-10 h-10 bg-blue-50 text-blue-600 font-bold flex items-center justify-center rounded-full border border-blue-100">3</div>
                  <div className="space-y-4 flex-1">
                     <div className="flex items-center gap-2">
                      <FileText size={18} className="text-slate-400" />
                      <h3 className="font-bold text-slate-800">Required Documents</h3>
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {details.documents?.map((doc, i) => (
                        <li key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Voting Method Section */}
                <div className="bg-white p-6 rounded-2xl border-2 border-blue-600 shadow-xl flex gap-6">
                  <div className="shrink-0 w-10 h-10 bg-blue-600 text-white font-bold flex items-center justify-center rounded-full">4</div>
                  <div className="space-y-4 flex-1">
                     <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-blue-600" />
                      <h3 className="font-bold text-slate-800 text-lg">Cast Your Vote</h3>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {details.method}
                    </p>
                  </div>
                </div>

                {/* Voting Method Deep Dive */}
                {details.votingMethodDetails && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                          <Settings size={16} />
                        </div>
                        <h3 className="font-bold text-slate-800">System Mechanics: {details.votingMethodDetails.type}</h3>
                      </div>
                      {details.partySystem && (
                        <div className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-full">
                          {details.partySystem}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed italic border-l-2 border-blue-200 pl-4">
                      {details.votingMethodDetails.description}
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">Democratic Advantages</p>
                        <ul className="space-y-2">
                          {details.votingMethodDetails.pros.map((pro, i) => (
                            <li key={i} className="text-xs text-emerald-800 font-medium flex gap-2">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0 mt-1" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                        <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest mb-3">System Criticisms</p>
                        <ul className="space-y-2">
                          {details.votingMethodDetails.cons.map((con, i) => (
                            <li key={i} className="text-xs text-rose-800 font-medium flex gap-2">
                              <div className="w-1.5 h-1.5 bg-rose-400 rounded-full shrink-0 mt-1" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'history' ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Historical Origin */}
              <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <HistoryIcon size={120} />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30">
                      <HistoryIcon size={20} />
                    </div>
                    <h3 className="text-xl font-bold italic tracking-tighter">THE ORIGIN STORY</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-medium">
                    {history?.origin || "Our AI is analyzing verified historical legislative records..."}
                  </p>
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                  <div className="w-4 h-px bg-slate-300" />
                   Democratic Milestones
                </h4>
                <div className="grid gap-4">
                  {history?.milestones.map((milestone, i) => (
                    <div 
                      key={i} 
                      className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 relative"
                    >
                      <div className="md:w-24 shrink-0">
                        <span className="text-2xl font-black text-blue-600 tracking-tighter italic">
                          {milestone.year}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-bold text-slate-800">{milestone.event}</h5>
                        <p className="text-sm text-slate-500 font-medium leading-normal">{milestone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Turnout Chart */}
              {history?.turnout && history.turnout.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                    <div className="w-4 h-px bg-slate-300" />
                     Voter Turnout Trends
                  </h4>
                  <div className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={history.turnout} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="year" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                            tickFormatter={(value) => `${value}%`}
                            dx={-10}
                          />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: 'none', 
                              borderRadius: '12px',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                              padding: '12px'
                            }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: '900', marginBottom: '4px', textTransform: 'uppercase' }}
                            formatter={(value: number) => [`${value}%`, 'Turnout']}
                          />
                          <Bar 
                            dataKey="percentage" 
                            radius={[8, 8, 8, 8]}
                            barSize={40}
                          >
                            {history.turnout.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.percentage > 70 ? '#2563eb' : '#64748b'} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-6 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-sm" />
                        High Participation ({'>'}70%)
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-slate-400 rounded-sm" />
                        Standard Participation
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Exhaustive Leadership Archive */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-4 h-px bg-slate-300" />
                     Complete Leadership Archive
                  </h4>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search archive..."
                      value={leaderSearch}
                      onChange={(e) => setLeaderSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Term</th>
                          <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Leader Name</th>
                          <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Political Party</th>
                          <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredPastLeaders.length > 0 ? (
                          filteredPastLeaders.map((lead, i) => (
                            <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                              <td className="p-4 font-mono text-[10px] text-slate-400 font-bold group-hover:text-blue-600">
                                {lead.term}
                              </td>
                              <td className="p-4">
                                <span className="text-sm font-bold text-slate-800">{lead.name}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                  {lead.party}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                {lead.links?.wikipedia && (
                                  <a 
                                    href={lead.links.wikipedia}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] font-black text-blue-500 hover:text-blue-700 uppercase tracking-widest transition-colors"
                                  >
                                    Wiki <ExternalLink size={10} />
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-12 text-center">
                              <p className="text-sm text-slate-400 font-medium italic">No leaders found matching "{leaderSearch}"</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="px-4 flex gap-3">
                   <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0 mt-1" />
                   <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                     Historical archive includes interim leaders and short-term appointments verified through legislative records.
                   </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="leadership"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Current Leader */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                      <Crown size={20} />
                    </div>
                    <h3 className="font-bold text-slate-800 tracking-tight">CURRENT EXECUTIVE</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 tracking-tight">{leadership?.current.name || details.topLeader?.name || 'Executive Branch'}</h4>
                      <p className="text-blue-600 font-bold text-sm tracking-tight">{leadership?.current.role || 'Head of State'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Political Party</p>
                        <p className="text-sm font-bold text-slate-700">{leadership?.current.party || details.currentRulingParty || 'Government'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">In Office Since</p>
                        <p className="text-sm font-bold text-slate-700 font-mono italic">{leadership?.current.since || 'Current Term'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Social & Official Links */}
                  {leadership?.current.links && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                      {leadership.current.links.wikipedia && (
                        <a 
                          href={leadership.current.links.wikipedia} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-blue-400 hover:text-blue-600 transition-all"
                        >
                          <Book size={12} />
                          Wikipedia
                        </a>
                      )}
                      {leadership.current.links.official && (
                        <a 
                          href={leadership.current.links.official} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-blue-400 hover:text-blue-600 transition-all"
                        >
                          <ExternalLink size={12} />
                          Official Site
                        </a>
                      )}
                      {leadership.current.links.twitter && (
                        <a 
                          href={leadership.current.links.twitter.startsWith('http') ? leadership.current.links.twitter : `https://twitter.com/${leadership.current.links.twitter.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-blue-400 hover:text-blue-600 transition-all"
                        >
                          <Twitter size={12} />
                          Twitter
                        </a>
                      )}
                      {leadership.current.links.instagram && (
                        <a 
                          href={leadership.current.links.instagram.startsWith('http') ? leadership.current.links.instagram : `https://instagram.com/${leadership.current.links.instagram.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-pink-400 hover:text-pink-600 transition-all font-sans"
                        >
                          <Instagram size={12} />
                          Instagram
                        </a>
                      )}
                      {leadership.current.links.facebook && (
                        <a 
                          href={leadership.current.links.facebook.startsWith('http') ? leadership.current.links.facebook : `https://facebook.com/${leadership.current.links.facebook}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-blue-700 hover:text-blue-700 transition-all font-sans"
                        >
                          <Facebook size={12} />
                          Facebook
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white space-y-6 shadow-xl shadow-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <TrendingUp size={20} />
                    </div>
                    <h3 className="font-bold tracking-tight">ELECTION PERFORMANCE</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black tracking-tighter italic">{leadership?.current.voteShare}</span>
                      <span className="text-blue-200 font-bold">of total votes</span>
                    </div>
                    <p className="text-blue-100 text-sm font-medium leading-relaxed">
                      Secured a decisive mandate in the last general election, reflecting the national preference for the {leadership?.current.party} platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* Historical Benchmarks */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                  <div className="w-4 h-px bg-slate-300" />
                   Historical Leaders & Results
                </h4>
                <div className="grid gap-4">
                  {leadership?.historical.map((lead, i) => (
                    <div 
                      key={i} 
                      className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 hover:border-blue-400 transition-all group"
                    >
                      <div className="md:w-32 shrink-0">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Term</span>
                        <span className="text-sm font-black text-blue-600 font-mono italic">
                          {lead.term}
                        </span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h5 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{lead.name}</h5>
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            {lead.party}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium leading-normal">{lead.context}</p>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <Award size={14} className="text-amber-500" />
                            Victory Margin: {lead.result}
                          </div>
                          {lead.links?.wikipedia && (
                            <a 
                              href={lead.links.wikipedia}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                            >
                              Wiki <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-28">
        <div className="p-6 bg-slate-900 rounded-[2rem] text-white space-y-6 shadow-2xl shadow-slate-200">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Clock size={20} className="text-blue-400" />
             </div>
             <h3 className="font-bold text-lg">Election Cycle</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            {details.timeline}
          </p>
          <div className="pt-4 border-t border-white/10">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Important Status</p>
            <div className="bg-blue-500/20 rounded-xl p-3 border border-blue-500/20 flex gap-3">
              <Info size={16} className="text-blue-400 shrink-0" />
              <p className="text-xs text-blue-100 leading-normal">Registration data is dynamic. AI results should be verified before deadlines.</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-[2rem] border border-slate-200 space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            Civic Protocol
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Data sourced from official national commission portals and AI-verified legislative texts.
          </p>
        </div>
      </aside>
    </div>
    </div>
  );
}
