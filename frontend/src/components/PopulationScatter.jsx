import React from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis, ResponsiveContainer, Cell 
} from 'recharts';
import { Users, Info } from 'lucide-react';

const COLORS = {
  safe: '#10b981',
  danger: '#ef4444',
  current: '#3b82f6',
  grid: '#1e293b'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">
          Patient Metadata
        </p>
        <div className="space-y-1.5 min-w-[120px]">
          <div className="flex justify-between items-center gap-4">
            <span className="text-[10px] text-slate-400">BP (Systolic)</span>
            <span className="text-xs font-mono text-white tracking-tight">{data.blood_pressure}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-[10px] text-slate-400">Cholesterol</span>
            <span className="text-xs font-mono text-white tracking-tight">{data.cholesterol}</span>
          </div>
          <div className="flex justify-between items-center gap-4 pt-1 border-t border-slate-800 mt-1">
            <span className="text-[10px] text-slate-400">Risk Profile</span>
            <span className={`text-[10px] font-black uppercase ${data.isHighRisk ? 'text-red-500' : 'text-emerald-500'}`}>
              {data.isHighRisk ? 'Critical' : 'Healthy'}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function PopulationScatter({ data, currentPatient }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
            <Users size={18} />
          </div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Population Context</h3>
        </div>
        <div className="group/tooltip relative">
          <Info size={16} className="text-slate-600 hover:text-slate-400 cursor-help transition-colors" />
          <div className="absolute right-0 bottom-full mb-2 w-48 p-3 bg-slate-800 text-[10px] leading-relaxed text-slate-300 rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none z-50 border border-slate-700 shadow-2xl">
            Compares current patient (Diamond) against 30 historical patient clusters (Circle).
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[14rem]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} opacity={0.5} />
            <XAxis 
              type="number" 
              dataKey="blood_pressure" 
              name="BP" 
              hide 
              domain={[80, 210]}
            />
            <YAxis 
              type="number" 
              dataKey="cholesterol" 
              name="Chol" 
              hide 
              domain={[80, 420]}
            />
            <ZAxis type="number" range={[60, 60]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            
            {/* Population Clusters */}
            <Scatter name="Population" data={data}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isHighRisk ? COLORS.danger : COLORS.safe} 
                  opacity={0.2}
                  className="hover:opacity-80 transition-opacity cursor-crosshair"
                />
              ))}
            </Scatter>

            {/* Current Patient Marker */}
            <Scatter 
              name="Current Patient" 
              data={[currentPatient]} 
              fill={COLORS.current}
              shape="diamond"
              className="animate-pulse"
            >
              <Cell 
                fill={COLORS.current} 
                className="drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"
              />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Normal Range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500/30" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">At Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 border border-blue-500 rotate-45" />
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest underline decoration-dotted underline-offset-4">Patient</span>
        </div>
      </div>
    </div>
  );
}
