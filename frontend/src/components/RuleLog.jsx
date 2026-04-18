import React from 'react';
import { Terminal, Cpu } from 'lucide-react';

const HighlightedRule = ({ rule }) => {
  // Regex to match keywords IF, AND, THEN
  const parts = rule.split(/(IF|AND|THEN)/g);
  return (
    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-[11px] leading-relaxed text-slate-400 border-l-2 border-l-blue-500 hover:border-l-blue-400 transition-all font-mono">
      {parts.map((part, i) => {
        if (['IF', 'AND', 'THEN'].includes(part)) {
          return <span key={i} className="text-blue-400 font-bold px-1">{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
};

export default function RuleLog({ rules = [] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-sm hover:shadow-md transition-all group">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
            <Terminal size={18} />
          </div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Inference Log</h3>
        </div>
        {rules.length > 0 && (
          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full font-bold border border-blue-500/20">
            {rules.length} RULES FIRED
          </span>
        )}
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-3 min-h-[16rem] max-h-72 bg-slate-900/30">
        {rules.length > 0 ? (
          rules.map((rule, i) => (
            <HighlightedRule key={i} rule={rule} />
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50 select-none">
            <Cpu size={32} strokeWidth={1.5} className="animate-pulse" />
            <div className="text-center">
              <p className="text-sm font-semibold">Awaiting inference engine...</p>
              <p className="text-xs">Trigger an analysis to view active clinical rules.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
