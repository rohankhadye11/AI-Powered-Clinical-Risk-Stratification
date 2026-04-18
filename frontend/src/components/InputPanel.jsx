import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { Settings, Info } from 'lucide-react';

const SLIDERS = [
  { 
    key: 'age', 
    label: 'Patient Age', 
    min: 20, 
    max: 100, 
    unit: 'yrs', 
    ariaLabel: 'Adjust Patient Age' 
  },
  { 
    key: 'blood_pressure', 
    label: 'Systolic BP', 
    min: 90, 
    max: 200, 
    unit: 'mmHg', 
    ariaLabel: 'Adjust Systolic Blood Pressure' 
  },
  { 
    key: 'cholesterol', 
    label: 'Serum Cholesterol', 
    min: 100, 
    max: 400, 
    unit: 'mg/dL', 
    ariaLabel: 'Adjust Serum Cholesterol' 
  },
];

export default function InputPanel({ vitals: initialVitals, onChange, onPredict, loading }) {
  // Local state for smooth slider dragging
  const [localVitals, setLocalVitals] = useState(initialVitals);

  // Synchronize local state if parent state changes outside (e.g., reset)
  useEffect(() => {
    setLocalVitals(initialVitals);
  }, [initialVitals]);

  // Debounced callback to notify parent of changes
  const debouncedChange = useCallback(
    debounce((name, value) => {
      onChange(name, value);
    }, 300),
    [onChange]
  );

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    
    // 1. Update local UI instantly
    setLocalVitals(prev => ({ ...prev, [name]: numValue }));
    
    // 2. Debounce the actual state update/API trigger
    debouncedChange(name, numValue);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group h-full">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-blue-400 group-hover:rotate-12 transition-transform">
            <Settings size={18} />
          </div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Control Panel</h3>
        </div>
        <div className="group/tooltip relative">
          <Info size={16} className="text-slate-600 hover:text-slate-400 cursor-help transition-colors" />
          <div className="absolute right-0 bottom-full mb-2 w-48 p-3 bg-slate-800 text-[10px] leading-relaxed text-slate-300 rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none z-50 border border-slate-700 shadow-2xl">
            Adjust physiological markers to simulate risk. The neuro-fuzzy engine will recalculate in real-time.
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {SLIDERS.map(({ key, label, min, max, unit, ariaLabel }) => {
          const value = localVitals[key];
          const percentage = ((value - min) / (max - min)) * 100;
          
          return (
            <div key={key} className="space-y-4">
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">{label}</label>
                <span className="text-sm font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded flex items-center gap-1.5 transition-all">
                  {value} <span className="text-[10px] font-bold text-slate-500">{unit}</span>
                </span>
              </div>
              
              <div className="relative group/range h-6 flex items-center">
                <input
                  type="range"
                  name={key}
                  min={min}
                  max={max}
                  value={value}
                  onChange={handleSliderChange}
                  aria-label={ariaLabel}
                  disabled={loading}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all z-10"
                  style={{
                    background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${percentage}%, rgb(30, 41, 59) ${percentage}%, rgb(30, 41, 59) 100%)`
                  }}
                />
                {/* Visual Glow follow thumb */}
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-blue-500/20 blur-md transition-all pointer-events-none rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}

        <button
          onClick={onPredict}
          disabled={loading}
          className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-blue-900/40 active:scale-[0.98] group flex items-center justify-center gap-3 overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Calibrating ANFIS...</span>
            </div>
          ) : (
            <>
              <span>Run Inference</span>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:animate-ping" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
