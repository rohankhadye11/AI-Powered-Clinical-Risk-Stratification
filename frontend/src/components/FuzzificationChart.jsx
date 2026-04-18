import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { Network, Info } from 'lucide-react';

const COLORS = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444',
  highlight: '#ffffff'
};

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">
          {label} {unit}
        </p>
        <div className="space-y-1.5">
          {payload.map((p, i) => (
            <div key={i} className="flex justify-between items-center gap-4">
              <span className="text-[10px] font-bold" style={{ color: p.color }}>{p.name}</span>
              <span className="text-xs font-mono text-white">{(p.value * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function FuzzificationChart({ data, activeTab, vitals, result }) {
  const units = {
    age: 'yrs',
    blood_pressure: 'mmHg',
    cholesterol: 'mg/dL',
    risk_score: '%'
  };

  const currentValue = activeTab === 'risk_score' ? (result?.crisp_risk_score || 0) : vitals[activeTab];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
            <Network size={18} />
          </div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">ANFIS Membership Logic</h3>
        </div>
        <div className="group/tooltip relative">
          <Info size={16} className="text-slate-600 hover:text-slate-400 cursor-help transition-colors" />
          <div className="absolute right-0 bottom-full mb-2 w-48 p-3 bg-slate-800 text-[10px] leading-relaxed text-slate-300 rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none z-50 border border-slate-700 shadow-2xl">
            Visualizes how crisp inputs are mapped to fuzzy linguistic sets (Low, Medium, High).
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[14rem]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="x" 
              tick={{fill: '#475569', fontSize: 10, fontWeight: 600}} 
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              hide 
              domain={[0, 1.1]} 
            />
            <Tooltip 
              content={<CustomTooltip unit={units[activeTab]} />}
              cursor={{ stroke: '#334155', strokeWidth: 1 }}
            />
            <Line 
              type="monotone" 
              dataKey="Low" 
              name="Low"
              stroke={COLORS.Low} 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 4, strokeWidth: 0 }}
              animationDuration={1000}
            />
            <Line 
              type="monotone" 
              dataKey="Medium" 
              name="Medium"
              stroke={COLORS.Medium} 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 4, strokeWidth: 0 }}
              animationDuration={1000}
            />
            <Line 
              type="monotone" 
              dataKey="High" 
              name="High"
              stroke={COLORS.High} 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 4, strokeWidth: 0 }}
              animationDuration={1000}
            />
            
            <ReferenceLine 
              x={currentValue} 
              stroke={COLORS.highlight} 
              strokeWidth={2} 
              strokeDasharray="4 4" 
              label={{
                position: 'top',
                value: `Input: ${currentValue}`,
                fill: '#fff',
                fontSize: 10,
                fontWeight: 800,
                className: 'drop-shadow-md'
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
