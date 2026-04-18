import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Cpu, BarChart3, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 pt-20 pb-32 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          New: Updated ANFIS Model v2.1
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-tight">
          AI-Powered <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
            Clinical Risk Stratification
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl mb-10 leading-relaxed">
          Leverage Adaptive Neuro-Fuzzy Inference Systems (ANFIS) to predict cardiovascular risk with full clinical explainability and real-time visualization.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/dashboard" 
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 group"
          >
            Go to Dashboard
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl border border-slate-800 transition-all">
            Documentation
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-24 border-t border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4 group">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 group-hover:border-blue-500/50 group-hover:bg-blue-500/5 transition-all">
              <ShieldCheck className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Input Vitals</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Input patient age, blood pressure, and cholesterol levels using intuitive interactive controls.
            </p>
          </div>

          <div className="space-y-4 group">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 group-hover:border-blue-500/50 group-hover:bg-blue-500/5 transition-all">
              <Cpu className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Neuro-Fuzzy Processing</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Our ANFIS model combines the learning power of neural networks with the logic of fuzzy systems.
            </p>
          </div>

          <div className="space-y-4 group">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 group-hover:border-blue-500/50 group-hover:bg-blue-500/5 transition-all">
              <BarChart3 className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Explainable Results</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Get clear, interpretable IF-THEN rules explaining the factors behind every risk prediction.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
