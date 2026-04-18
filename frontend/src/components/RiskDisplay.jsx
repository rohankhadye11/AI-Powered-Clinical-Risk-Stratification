import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { Activity, ShieldCheck, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const COLORS = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444',
  base: '#1e293b'
};

const CATEGORIES = [
  { name: 'Low', min: 0, max: 40, icon: ShieldCheck, color: COLORS.Low, glow: 'rgba(16,185,129,0.3)' },
  { name: 'Medium', min: 40, max: 70, icon: AlertTriangle, color: COLORS.Medium, glow: 'rgba(245,158,11,0.3)' },
  { name: 'High', min: 70, max: 100, icon: AlertCircle, color: COLORS.High, glow: 'rgba(239,68,68,0.3)' },
];

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 20} dy={8} textAnchor="middle" fill="#94a3b8" className="text-[10px] font-bold uppercase tracking-widest">
        Risk Factor
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#fff" className="text-3xl font-black tabular-nums">
        {value.toFixed(1)}%
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
      />
    </g>
  );
};

export default function RiskDisplay({ result }) {
  const score = result?.crisp_risk_score || 0;
  const category = result?.risk_category || 'Low';
  const config = CATEGORIES.find(c => c.name === category) || CATEGORIES[0];
  const Icon = config.icon;

  const data = [
    { name: 'Score', value: score, fill: config.color },
    { name: 'Remaining', value: 100 - score, fill: COLORS.base },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden h-full">
      {/* Background Accent */}
      <div 
        className="absolute -top-12 -right-12 w-32 h-32 blur-[60px] opacity-20 transition-all duration-700"
        style={{ backgroundColor: config.color }}
      />

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
            <Activity size={18} />
          </div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Assessment Score</h3>
        </div>
        <div className="group/tooltip relative">
          <Info size={16} className="text-slate-600 hover:text-slate-400 cursor-help transition-colors" />
          <div className="absolute right-0 bottom-full mb-2 w-48 p-3 bg-slate-800 text-[10px] leading-relaxed text-slate-300 rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none z-50 border border-slate-700 shadow-2xl">
            Calculated via centroid defuzzification of the firing rule activations.
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="w-full h-52 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="85%"
                startAngle={180}
                endAngle={0}
                innerRadius="65%"
                outerRadius="90%"
                paddingAngle={0}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
                activeShape={renderActiveShape}
                activeIndex={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Badge */}
        <div 
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-500"
          style={{ 
            backgroundColor: `${config.color}15`, 
            borderColor: `${config.color}30` 
          }}
        >
          <Icon size={16} style={{ color: config.color }} />
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: config.color }}>
            {config.name} Risk Level
          </span>
        </div>

        {/* Legend */}
        <div className="w-full mt-6 grid grid-cols-3 gap-2">
          {CATEGORIES.map(cat => (
            <div 
              key={cat.name} 
              className={`flex flex-col items-center p-2 rounded-lg border transition-all duration-300 ${cat.name === category ? 'bg-slate-800/50 border-slate-700' : 'border-transparent'}`}
            >
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">{cat.name}</span>
              <div 
                className="w-full h-1 rounded-full mt-1.5 opacity-30"
                style={{ backgroundColor: cat.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
