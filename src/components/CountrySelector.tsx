/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { COUNTRIES } from '../data/countries';
import { CountryData } from '../types';
import { ArrowRight, Search, Globe, LayoutGrid, Map as MapIcon, Plus, Check } from 'lucide-react';
import { useState, useMemo } from 'react';
import WorldMap from './WorldMap';
import { useAuth } from '../context/AuthContext';

interface Props {
  onSelect: (id: string) => void;
}

export default function CountrySelector({ onSelect }: Props) {
  const { favorites, toggleFavorite } = useAuth();
  const [search, setSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState<string | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const regions = ['All', 'Europe', 'Asia', 'Africa', 'Americas', 'Oceania'];

  const filteredCountries = useMemo(() => {
    return Object.values(COUNTRIES).filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesRegion = activeRegion === 'All' || c.region === activeRegion;
      return matchesSearch && matchesRegion;
    });
  }, [search, activeRegion]);

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Select Your Region</h2>
            <p className="text-slate-500 font-medium">Access verified election data and registration guides worldwide.</p>
          </div>

          <div className="flex items-center justify-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grid' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={16} />
              Grid View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'map' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <MapIcon size={16} />
              Interactive Map
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search for a country (e.g. Australia, Japan, Brazil...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-6 pl-14 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none text-lg font-medium shadow-sm transition-all placeholder:text-slate-300"
            />
          </div>

          <div className="flex gap-2 justify-center overflow-x-auto pb-4 no-scrollbar">
            {regions.map(region => (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all border-2 ${
                  activeRegion === region 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'map' ? (
          <motion.div
            key="map-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <WorldMap onSelect={onSelect} />
          </motion.div>
        ) : (
          <div key="grid-view">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredCountries.map((country, index) => {
                  const isFavorite = favorites.includes(country.id);
                  return (
                    <motion.div
                      layout
                      key={country.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all group flex flex-col gap-6 relative"
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(country.id);
                        }}
                        className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${
                          isFavorite 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                          : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100'
                        }`}
                        title={isFavorite ? "In comparison" : "Add to comparison"}
                      >
                        {isFavorite ? <Check size={18} /> : <Plus size={18} />}
                      </button>

                      <button 
                        onClick={() => onSelect(country.id)}
                        className="text-left w-full h-full flex flex-col"
                      >
                        <div className="space-y-4 pr-12">
                          <div className="flex justify-between items-start">
                            <span className="text-4xl block group-hover:scale-110 transition-transform">{country.flag}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
                              {country.region}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-800">
                            {country.name}
                          </h3>
                          <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 font-medium">
                            {country.isDetailed 
                              ? `Detailed voter eligibility, registration steps, and key documents for ${country.name}.`
                              : `Verified registration flow and civic participation guides for ${country.name}.`}
                          </p>
                        </div>
                        
                        <div className="mt-auto flex items-center justify-between text-blue-600 font-bold text-sm">
                          <span className="tracking-tight">{country.isDetailed ? 'View Full Guide' : 'AI Analysis Ready'}</span>
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <ArrowRight size={14} strokeWidth={2.5} />
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredCountries.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 space-y-4"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
                  <Globe size={40} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-slate-900">Country Not Found</h3>
                  <p className="text-slate-500 font-medium">Try searching in a different region or check your spelling.</p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
