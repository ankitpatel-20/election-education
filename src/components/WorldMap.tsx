import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { COUNTRIES } from "../data/countries";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface Props {
  onSelect: (id: string) => void;
}

export default function WorldMap({ onSelect }: Props) {
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);

  const handleCountryClick = (geo: any) => {
    const geoName = geo.properties.name;
    
    // Find matching country in our database
    const match = Object.values(COUNTRIES).find(c => 
      c.name.toLowerCase() === geoName.toLowerCase() || 
      (c.id === 'usa' && geoName === 'United States of America') ||
      (c.id === 'uk' && geoName === 'United Kingdom')
    );

    if (match) {
      onSelect(match.id);
    }
  };

  return (
    <div className="relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm h-[500px]">
      <div className="absolute top-6 left-6 z-10 space-y-1">
        <h3 className="font-bold text-slate-800">Interactive World Map</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click a country to view election data</p>
      </div>

      <ComposableMap 
        projectionConfig={{ scale: 140 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isAvailable = Object.values(COUNTRIES).some(c => 
                  c.name.toLowerCase() === geo.properties.name.toLowerCase() ||
                  (c.id === 'usa' && geo.properties.name === 'United States of America') ||
                  (c.id === 'uk' && geo.properties.name === 'United Kingdom')
                );

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(e) => {
                      setTooltip({
                        name: geo.properties.name,
                        x: e.pageX,
                        y: e.pageY
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => handleCountryClick(geo)}
                    style={{
                      default: {
                        fill: isAvailable ? "#3b82f6" : "#f1f5f9",
                        outline: "none",
                        stroke: "#cbd5e1",
                        strokeWidth: 0.5,
                        transition: "all 250ms"
                      },
                      hover: {
                        fill: isAvailable ? "#2563eb" : "#e2e8f0",
                        outline: "none",
                        cursor: isAvailable ? "pointer" : "default"
                      },
                      pressed: {
                        fill: "#1d4ed8",
                        outline: "none"
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ 
              position: 'fixed', 
              left: tooltip.x + 10, 
              top: tooltip.y - 40,
              pointerEvents: 'none'
            }}
            className="z-50 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl flex items-center gap-2"
          >
            <span>{tooltip.name}</span>
            {Object.values(COUNTRIES).some(c => 
              c.name.toLowerCase() === tooltip.name.toLowerCase() ||
              (c.id === 'usa' && tooltip.name === 'United States of America') ||
              (c.id === 'uk' && tooltip.name === 'United Kingdom')
            ) ? (
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            ) : (
              <span className="text-slate-500 text-[10px] font-normal italic">No Data</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 right-6 flex items-center gap-4 bg-white/80 backdrop-blur p-3 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-sm" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-100 border border-slate-300 rounded-sm" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Support coming</span>
        </div>
      </div>
    </div>
  );
}
