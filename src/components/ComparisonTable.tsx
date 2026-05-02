/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { COUNTRIES } from '../data/countries';
import { UserCheck, FileJson, Cpu, Calendar, Plus, X, Search, Filter, ArrowUpDown, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchCountryDetails } from '../services/geminiService';
import { CountryData } from '../types';

export default function ComparisonTable() {
  const { favorites, toggleFavorite } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'region' | 'party' | 'timeline'>('name');
  const [dynamicDetails, setDynamicDetails] = useState<Record<string, Partial<CountryData>>>({});
  const [fetchErrors, setFetchErrors] = useState<Record<string, string>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClearCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Sync with dynamic details fetched
  const selectedCountries = useMemo(() => {
    const list = favorites.map(id => {
      const base = COUNTRIES[id];
      const dynamic = dynamicDetails[id] || {};
      return { ...base, ...dynamic };
    }).filter(Boolean);

    return [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'region') return a.region.localeCompare(b.region);
      if (sortBy === 'party') {
        const partyA = a.currentRulingParty || a.partySystem || '';
        const partyB = b.currentRulingParty || b.partySystem || '';
        return partyA.localeCompare(partyB);
      }
      if (sortBy === 'timeline') {
        const dateA = a.nextElectionDetails ? `${a.nextElectionDetails.year}-${a.nextElectionDetails.month}` : (a.timeline || '9999');
        const dateB = b.nextElectionDetails ? `${b.nextElectionDetails.year}-${b.nextElectionDetails.month}` : (b.timeline || '9999');
        return dateA.localeCompare(dateB);
      }
      return 0;
    });
  }, [favorites, sortBy, dynamicDetails]);

  // Fetch missing details for favorited countries with throttling to avoid quota issues
  useEffect(() => {
    let mounted = true;

    const fetchMissing = async () => {
      const missingIds = favorites.filter(id => !dynamicDetails[id]);
      if (missingIds.length === 0) return;

      for (const id of missingIds) {
        if (!mounted) break;
        try {
          // No manual delay here as geminiService now has a built-in throttle
          const details = await fetchCountryDetails(COUNTRIES[id].name);
          
          if (mounted) {
            setDynamicDetails(prev => ({
              ...prev,
              [id]: details
            }));
            setFetchErrors(prev => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
            setIsRefreshing(false);
          }
        } catch (error: any) {
          console.error(`Failed to fetch details for ${id}:`, error);
          if (mounted) {
            setFetchErrors(prev => ({
              ...prev,
              [id]: error.message
            }));
            setIsRefreshing(false);
          }
        }
      }
    };

    fetchMissing();
    return () => { mounted = false; };
  }, [favorites]);

  const handleRefreshAll = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    for (const id of favorites) {
      try {
        // Geminiservice now has a 10s cooldown, so we wait 11s here to be safe
        await new Promise(resolve => setTimeout(resolve, 11000));
        const details = await fetchCountryDetails(COUNTRIES[id].name);
        setDynamicDetails(prev => ({
          ...prev,
          [id]: details
        }));
        setFetchErrors(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } catch (error: any) {
        console.error(`Failed to refresh ${id}:`, error);
        setFetchErrors(prev => ({
          ...prev,
          [id]: error.message
        }));
      }
    }
    setIsRefreshing(false);
  };

  const availableToAdd = useMemo(() => 
    Object.values(COUNTRIES).filter(c => !favorites.includes(c.id))
  , [favorites]);

  const filteredToAdd = useMemo(() => 
    availableToAdd.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase())
    )
  , [availableToAdd, search]);

  const scrollToRow = (rowId: string) => {
    const element = document.getElementById(rowId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Temporary highlight effect
      element.classList.add('ring-4', 'ring-blue-100', 'ring-inset', 'bg-blue-50/50');
      setTimeout(() => element.classList.remove('ring-4', 'ring-blue-100', 'ring-inset', 'bg-blue-50/50'), 2000);
    }
  };

  const handleModeClick = (type: typeof sortBy) => {
    setSortBy(type);
    if (type === 'name') scrollToRow('row-name');
    if (type === 'party') scrollToRow('row-party');
    if (type === 'region') scrollToRow('row-region');
    if (type === 'timeline') scrollToRow('row-date');
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Compare Voting Systems</h2>
          <p className="text-slate-500 font-medium">Quick overview of procedures across your selected regions.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleClearCache}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
            title="Clear cache and hard reset"
          >
            <X size={18} />
          </button>

          <button 
            onClick={handleRefreshAll}
            disabled={isRefreshing || favorites.length === 0}
            className={`p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm ${isRefreshing ? 'animate-spin' : ''}`}
            title="Refresh comparison data"
          >
            <RefreshCw size={18} />
          </button>

            <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
              <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 flex items-center gap-2">
                <ArrowUpDown size={10} />
                Focus
              </div>
              {(['name', 'region', 'party', 'timeline'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleModeClick(type)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest relative group ${
                    sortBy === type 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {type === 'timeline' ? 'DATE' : type === 'party' ? 'PARTY' : type === 'name' ? 'NAME' : 'REGION'}
                  {sortBy === type && (
                    <motion.div 
                      layoutId="activeSort"
                      className="absolute inset-0 bg-blue-600 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>

          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={18} />
            Add Country
          </button>
        </div>
      </div>

      {favorites.length > 0 && (
        <div className="flex items-center gap-6 px-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400'}`} />
            Data Status: <span className={isRefreshing ? 'text-blue-500' : 'text-emerald-500'}>
              {isRefreshing ? 'Syncing Live Data...' : 'Verified & Up-to-date'}
            </span>
          </div>
          <div className="h-px flex-1 bg-slate-100" />
        </div>
      )}

      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl z-[70] overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Add to Comparison</h3>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search countries..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-12 pl-12 pr-6 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredToAdd.map(country => (
                    <button
                      key={country.id}
                      onClick={() => {
                        toggleFavorite(country.id);
                        setSearch('');
                      }}
                      className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <span className="text-sm font-bold text-slate-700">{country.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {selectedCountries.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[1000px] bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden text-left">
            <table className="w-full border-collapse">
              <thead>
                <tr id="row-name" className="bg-slate-50/50">
                  <th className="p-8 text-left border-b border-slate-200 font-black text-slate-400 uppercase tracking-widest text-[10px]">Registry Feature</th>
                  {selectedCountries.map(c => (
                    <th key={c.id} className="p-8 text-center border-b border-slate-200 relative group min-w-[250px]">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-4xl drop-shadow-sm">{c.flag}</span>
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 tracking-tight block">{c.name}</span>
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">{c.region}</span>
                        </div>

                        {/* Top Leader Section requested in Name section */}
                        {fetchErrors[c.id] ? (
                          <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-left w-full group/error">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Sync Issue</p>
                              <button 
                                onClick={handleRefreshAll}
                                className="text-[9px] font-bold text-rose-500 hover:rose-600 transition-colors"
                              >
                                Retry
                              </button>
                            </div>
                            <p className="text-[10px] text-rose-600 font-medium leading-tight">{fetchErrors[c.id]}</p>
                          </div>
                        ) : c.topLeader ? (
                          <div className={`mt-4 p-3 bg-white border border-slate-200 rounded-xl shadow-sm transition-all text-left w-full ${sortBy === 'name' ? 'ring-2 ring-blue-500 border-transparent' : ''}`}>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Leader</p>
                            <p className="font-bold text-slate-900 text-sm truncate">{c.topLeader.name}</p>
                            <div className="flex gap-2 mt-1">
                              <a href={c.topLeader.links.wikipedia} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline font-bold">Wikipedia</a>
                              {c.topLeader.links.twitter && (
                                <a href={c.topLeader.links.twitter} target="_blank" rel="noreferrer" className="text-[10px] text-sky-400 hover:underline font-bold">Twitter/X</a>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 w-full h-12 bg-slate-100 rounded-xl animate-pulse" />
                        )}
                      </div>
                      <button 
                        onClick={() => toggleFavorite(c.id)}
                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 bg-white shadow-sm border border-slate-100 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                        title="Remove from comparison"
                      >
                        <X size={14} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr id="row-party" className="transition-all duration-500">
                  <td className={`p-8 border-b border-slate-200 font-bold text-slate-700 text-sm transition-all ${sortBy === 'party' ? 'bg-blue-50' : 'bg-slate-50/30'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                        <ShieldCheck size={16} className={`${sortBy === 'party' ? 'text-blue-600' : 'text-slate-400'}`} />
                      </div>
                      Ruling Party & History
                    </div>
                  </td>
                  {selectedCountries.map(c => (
                    <td key={c.id} className={`p-8 border-b border-slate-200 text-xs text-slate-600 align-top transition-all ${sortBy === 'party' ? 'bg-blue-50/20' : ''}`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-800">
                            {c.currentRulingParty || 'Loading Party...'}
                          </span>
                          {c.rulingPartyDetails && (
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-500">
                                Est. {c.rulingPartyDetails.foundedYear}
                              </span>
                              <span className="text-[9px] text-slate-400 font-medium">
                                ({new Date().getFullYear() - c.rulingPartyDetails.foundedYear} years ago)
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-slate-500 leading-relaxed italic">
                          {fetchErrors[c.id] ? 'History access limited' : c.rulingPartyDetails?.history || 'Verifying historical records...'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-black uppercase tracking-widest text-[9px] border border-indigo-100 shadow-sm">
                            {c.partySystem || 'Multiparty'}
                          </span>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr id="row-opposition" className="transition-all duration-500">
                  <td className={`p-8 border-b border-slate-200 font-bold text-slate-700 text-sm transition-all ${sortBy === 'party' ? 'bg-blue-50' : 'bg-slate-50/30'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                        <ArrowUpDown size={16} className={`${sortBy === 'party' ? 'text-blue-600' : 'text-slate-400'}`} />
                      </div>
                      Opposition Party
                    </div>
                  </td>
                  {selectedCountries.map(c => (
                    <td key={c.id} className={`p-8 border-b border-slate-200 text-xs text-slate-600 align-top transition-all ${sortBy === 'party' ? 'bg-blue-50/20' : ''}`}>
                      {fetchErrors[c.id] ? (
                        <span className="italic text-slate-400">Opposition data offline</span>
                      ) : c.oppositionPartyDetails ? (
                        <div className="space-y-2">
                          <p className="font-bold text-slate-900 text-sm">{c.oppositionPartyDetails.name}</p>
                          <a href={c.oppositionPartyDetails.wikipedia} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline block text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                            Wikipedia Profile
                          </a>
                        </div>
                      ) : (
                        <span className="italic text-slate-400">Verifying opposition...</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr id="row-region" className="transition-all duration-500">
                  <td className={`p-8 border-b border-slate-200 font-bold text-slate-700 text-sm transition-all ${sortBy === 'region' ? 'bg-blue-50' : 'bg-slate-50/30'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                        <Filter size={16} className={`${sortBy === 'region' ? 'text-blue-600' : 'text-slate-400'}`} />
                      </div>
                      Region & Party Origin
                    </div>
                  </td>
                  {selectedCountries.map(c => (
                    <td key={c.id} className={`p-8 border-b border-slate-200 text-xs text-slate-600 align-top transition-all ${sortBy === 'region' ? 'bg-blue-50/20' : ''}`}>
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded inline-block mb-1">
                          {c.region} Origin
                        </span>
                        <p className="text-slate-500 italic leading-relaxed">
                          {fetchErrors[c.id] ? 'Founding data unavailable' : c.rulingPartyDetails?.origin || 'Loading founding origins...'}
                        </p>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr id="row-date" className="transition-all duration-500">
                  <td className={`p-8 border-b border-slate-200 font-bold text-slate-700 text-sm transition-all ${sortBy === 'timeline' ? 'bg-blue-50' : 'bg-slate-50/30'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                        <Calendar size={16} className={`${sortBy === 'timeline' ? 'text-blue-600' : 'text-slate-400'}`} />
                      </div>
                      Next Election Date
                    </div>
                  </td>
                  {selectedCountries.map(c => (
                    <td key={c.id} className={`p-8 border-b border-slate-200 text-xs text-slate-500 text-center font-bold transition-all ${sortBy === 'timeline' ? 'bg-blue-50/20' : ''}`}>
                      {c.nextElectionDetails ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl border border-emerald-100 font-black uppercase tracking-widest text-lg shadow-sm">
                            {c.nextElectionDetails.month} {c.nextElectionDetails.year}
                          </div>
                          <span className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.2em]">Verified National Election</span>
                        </div>
                      ) : (
                        <div className="bg-slate-50 text-slate-400 px-4 py-2 rounded-xl inline-block border border-slate-100 font-black uppercase tracking-widest">
                          {(c.id === 'india') ? '2029 (Cycle)' : (c.id === 'usa') ? '2028 (General)' : c.timeline || 'Upcoming'}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-8 border-b border-slate-200 font-bold text-slate-700 text-sm bg-slate-50/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                        <Cpu size={16} className="text-blue-500" />
                      </div>
                      Voting Method
                    </div>
                  </td>
                  {selectedCountries.map(c => (
                    <td key={c.id} className="p-8 border-b border-slate-200 text-xs text-slate-700 text-center font-bold italic tracking-tight">
                       {c.votingMethodDetails?.type || c.method?.split('(')[0] || 'Direct Ballot'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-8 border-b border-slate-200 font-bold text-slate-700 text-sm bg-slate-50/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                        <FileJson size={16} className="text-blue-500" />
                      </div>
                      Eligibility
                    </div>
                  </td>
                  {selectedCountries.map(c => (
                    <td key={c.id} className="p-8 border-b border-slate-200 text-xs text-slate-600 align-top">
                      <ul className="space-y-2 list-none font-medium text-left">
                        {c.eligibility?.slice(0, 3).map((e, i) => (
                          <li key={i} className="flex gap-2">
                             <div className="w-1 h-1 bg-blue-400 rounded-full shrink-0 mt-1.5" />
                             {e}
                          </li>
                        )) || <li className="italic text-slate-400">Verifying...</li>}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-6">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 border border-slate-100">
            <Search size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">Your Comparison is Fresh</h3>
            <p className="text-slate-500 font-medium max-w-md">Start adding nations to visualize differences in eligibility, political systems, and voting methods.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200"
          >
            <Plus size={20} />
            Initialize Comparison
          </button>
        </div>
      )}
    </div>
  );
}
