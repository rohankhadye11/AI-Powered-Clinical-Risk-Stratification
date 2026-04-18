import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import { UserCircle2, Info } from 'lucide-react';

const COLORS = {
  patient: '#3b82f6',
  ideal: '#10b981',
  grid: '#1e293b',
  text: '#64748b'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">
          {payload[0].payload.subject}
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center gap-6">
            <span className="text-[10px] font-bold" style={{ color: COLORS.patient }}>Current Patient</span>
            <span className="text-xs font-mono text-white">{payload[0].value}</span>
          </div>
          <div className="flex justify-between items-center gap-6">
            <span className="text-[10px] font-bold" style={{ color: COLORS.ideal }}>Ideal Baseline</span>
            <span className="text-xs font-mono text-white">{payload[1].value}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function RadarProfile({ data }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
            <UserCircle2 size={18} />
          </div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Clinical Profile</h3>
        </div>
        <div className="group/tooltip relative">
          <Info size={16} className="text-slate-600 hover:text-slate-400 cursor-help transition-colors" />
          <div className="absolute right-0 bottom-full mb-2 w-48 p-3 bg-slate-800 text-[10px] leading-relaxed text-slate-300 rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none z-50 border border-slate-700 shadow-2xl">
            Normalized comparison of patient vitals against medical benchmarks (Age 30, BP 120, Chol 190).
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[14rem]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke={COLORS.grid} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: COLORS.text, fontSize: 10, fontWeight: 700 }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 'auto']} 
              tick={false} 
              axisLine={false} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Patient"
              dataKey="A"
              stroke={COLORS.patient}
              fill={COLORS.patient}
              fillOpacity={0.4}
              animationDuration={1500}
            />
            <Radar
              name="Ideal"
              dataKey="B"
              stroke={COLORS.ideal}
              fill={COLORS.ideal}
              fillOpacity={0.1}
              animationDuration={1500}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
